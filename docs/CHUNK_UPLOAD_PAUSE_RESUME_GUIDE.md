# Chunk Upload with Pause, Resume, and Retry — Learning Guide

This guide explains how large file uploads work in this project. You can save or print this page as a PDF from your browser (Ctrl+P → Save as PDF).

---

## 1. What problem are we solving?

Uploading a 100 MB file in one HTTP request is risky:

- Slow networks may time out.
- If the connection drops at 90%, you lose all progress.
- The browser may run out of memory.

**Solution:** Split the file into **chunks** (10 MB each). Upload chunk 0, then chunk 1, and so on. The server saves each piece on disk and **merges** them when the last chunk arrives.

**Pause / resume** lets the user stop sending chunks and continue later from the **last successful chunk**.

---

## 2. Big picture (simple diagram)

```
Browser                         Django API                    Disk + Database
-------                         ----------                    ---------------

File (100 MB)
  |
  +-- chunk 0 (10 MB) ----POST /files/upload/chunk/----> save chunk_0
  +-- chunk 1 (10 MB) ----POST /files/upload/chunk/----> save chunk_1
  |       ...
  +-- chunk 9 (last)   ----POST /files/upload/chunk/----> merge all -> File record
                                                          delete temp chunks
                                                          mark session "completed"
```

When the user clicks **Pause**, the browser stops sending new chunks. The server marks the session as `paused`.

When the user clicks **Resume**, the browser asks the server **which chunks already exist**, then continues from the next missing index.

---

## 3. Limits (rules)

| Rule | Value |
|------|--------|
| Max size per file | 100 MB |
| Max storage per user | 1 GB |
| Chunk size | 10 MB |
| Session expires | 24 hours |

**File type check:** On **chunk 0 only**, the server reads the first 2 KB and uses **python-magic** to detect the real MIME type. It must be in the allow-list and match what the client sent (or client sends `application/octet-stream` and server trusts magic).

---

## 4. Database model: `ChunkUploadSession`

**File:** `rapidrise_sample/files/models.py`

Each upload gets a unique `upload_id` (string from the frontend, e.g. `abc123_x7k2p9`).

| Field | Meaning |
|-------|---------|
| `upload_id` | Unique id for this upload attempt |
| `user` | Who is uploading |
| `file_name`, `file_size`, `content_type`, `total_chunks` | Metadata |
| `chunks_received` | JSON list of chunk numbers already saved, e.g. `[0, 1, 2]` |
| `status` | `uploading`, `paused`, `completed`, `failed`, `cancelled` |
| `expires_at` | Session cleanup after 24 hours |

**Why we need this:** Temp files on disk alone do not tell us the **status** (paused vs uploading) in a way that is easy to query per user. The DB row is the source of truth for progress APIs.

---

## 5. Backend layers (who does what)

### 5.1 Serializer (`files/serializers.py`)

**Job:** Validate incoming data **before** any file is written.

- `ChunkUploadSerializer` — each chunk POST: sizes, MIME on chunk 0, optional `action` / `description`.
- `ChunkUploadStatusQuerySerializer` — GET status: requires `upload_id`.
- `ChunkUploadControlSerializer` — pause / resume / cancel: `upload_id` + `action`.

Serializers do **not** save files. They only check rules and return errors (400/409).

### 5.2 Service (`files/services.py`)

**`ChunkUploadService`** — all chunk session logic:

| Method | Purpose |
|--------|---------|
| `get_or_create_session` | Start or continue an upload |
| `save_chunk_file` | Write bytes to `media/temp_uploads/{upload_id}/chunk_{n}` |
| `chunk_already_stored` | Skip re-upload if chunk file exists (idempotent retry) |
| `mark_chunk_received` | Add index to `chunks_received` in DB |
| `sync_session_from_disk` | Align DB list with files on disk |
| `get_next_chunk_index` | First missing chunk (for resume) |
| `progress_payload` | Build JSON: percent, `next_chunk`, `uploaded_chunks` |
| `pause_session` / `resume_session` / `cancel_session` | User control |

**`FileService.complete_chunk_upload`** — when all chunks exist:

1. Merge `chunk_0` … `chunk_N` into one file under `media/uploads/`.
2. Check MD5 checksum and file size.
3. Handle duplicates (`replace` / `keep_both`).
4. Create `File` row and update storage quota.
5. Delete temp folder and mark session `completed`.

### 5.3 Views (`files/views.py`)

Thin controllers: validate → call service → return JSON.

| Endpoint | Method | Role |
|----------|--------|------|
| `/files/upload/chunk/` | POST | Upload one chunk |
| `/files/upload/chunk/status/?upload_id=` | GET | Resume info |
| `/files/upload/chunk/control/` | POST | pause / resume / cancel |

**Example chunk response (not last chunk):**

```json
{
  "upload_id": "abc_x7k2",
  "status": "uploading",
  "progress_percent": 30,
  "uploaded_chunks": [0, 1, 2],
  "next_chunk": 3,
  "chunk_index": 2,
  "already_uploaded": false,
  "message": "Chunk 2 received"
}
```

**Last chunk (201):**

```json
{
  "message": "File uploaded successfully",
  "file": { "id": "...", "name": "report.pdf", "status": "success" },
  "progress_percent": 100,
  "status": "completed"
}
```

---

## 6. Frontend (`UploadFile.jsx`)

### 6.1 File state (per row in the list)

```javascript
{
  id: 'local-id',
  name: 'video.mp4',
  raw: File,              // browser File object
  status: 'pending',      // pending | uploading | paused | completed | error
  progress: 0,            // 0-100
  uploadId: null,         // set when upload starts
  nextChunkIndex: 0,
  totalChunks: 10,
}
```

### 6.2 Control ref (pause / cancel flags)

```javascript
uploadControlRef.current[fileId] = {
  pauseRequested: false,
  cancelRequested: false,
};
```

The upload loop calls `waitWhilePaused()` before each chunk. If `pauseRequested` is true, it waits until the user clicks Resume.

### 6.3 Upload loop (simplified)

1. `resolveUploadSession` — new `uploadId` or GET status from server for `next_chunk`.
2. For `chunkIndex` from `startChunk` to `totalChunks - 1`:
   - Wait if paused.
   - Build `FormData` with chunk bytes.
   - POST with up to **3 retries** on network error.
   - On failure after retries → set status `paused`, save `nextChunkIndex`, tell server `pause`.
3. On 201 → status `completed`.

### 6.4 Buttons

| Button | Action |
|--------|--------|
| Pause | Set `pauseRequested`, PATCH server `pause` |
| Resume | Server `resume`, clear pause flag, restart loop from `next_chunk` |
| Stop (cancel) | Server `cancel`, delete temp files, reset file to `pending` |

### 6.5 API helpers (`fileService.js`)

```javascript
uploadFileChunk(formData)
getChunkUploadStatus(uploadId)
controlChunkUpload(uploadId, 'pause' | 'resume' | 'cancel')
```

---

## 7. Retry and resume (step by step)

### Network error during chunk 5

1. Chunk 5 fails 3 times.
2. Frontend sets `status: 'paused'`, `nextChunkIndex: 5`, keeps `uploadId`.
3. Server already has chunks 0–4 on disk and in `chunks_received`.

### User clicks Resume

1. Frontend calls `GET /files/upload/chunk/status/?upload_id=...`
2. Server returns `"next_chunk": 5`
3. Frontend uploads chunk 5, 6, … again (chunks 0–4 are skipped via `already_uploaded`).

### User clicks Pause while uploading

1. Frontend sets `pauseRequested = true`.
2. Current chunk request may still finish (that is OK).
3. Loop blocks in `waitWhilePaused()` until Resume.

### User clicks Cancel

1. Server deletes `media/temp_uploads/{upload_id}/` and sets session `cancelled`.
2. Frontend clears `uploadId` and progress.

---

## 8. Idempotent chunks (why re-sending is safe)

If the client sends **chunk 2** again:

1. Server sees `chunk_2` file already on disk.
2. Returns 200 with `already_uploaded: true`.
3. Does not corrupt the file.

This makes retries safe.

---

## 9. Setup checklist

1. Run migration:
   ```bash
   python manage.py migrate files
   ```
2. Install python-magic on the server (for MIME detection).
3. Ensure `MEDIA_ROOT` is writable (`temp_uploads/` and `uploads/`).
4. Frontend chunk size must stay **10 MB** (same as `MAX_CHUNK_BYTES` in serializer).

---

## 10. Files changed (reference)

| Area | Files |
|------|--------|
| Model | `files/models.py` — `ChunkUploadSession` |
| Migration | `files/migrations/0049_chunkuploadsession.py` |
| Service | `files/services.py` — `ChunkUploadService` |
| Serializer | `files/serializers.py` |
| Views / URLs | `files/views.py`, `files/urls.py` |
| Frontend | `src/pages/user/UploadFile.jsx`, `src/services/fileService.js` |

---

## 11. One-page mental model

1. **Chunk** = small piece of the file (10 MB).
2. **upload_id** = name of the folder where chunks are stored.
3. **Session row** = progress bar data in the database.
4. **Serializer** = gatekeeper (validates).
5. **Service** = worker (reads/writes disk + DB).
6. **View** = receptionist (HTTP in/out).
7. **Frontend loop** = sends chunks, respects pause, retries, asks server where to continue.

That is the full flow. Read the code in the order above if you want to trace a single chunk from button click to file in the drive.

---

*Generated for the inv-rr-frontend + rapidrise_sample chunk upload feature.*
