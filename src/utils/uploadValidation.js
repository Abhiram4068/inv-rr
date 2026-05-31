/**
 * Upload limits and allowed types — keep in sync with backend:
 * rapidrise_sample/files/upload_validation.py
 * rapidrise_sample/files/serializers.py (ChunkUploadSerializer)
 */

export const CHUNK_SIZE = 10 * 1024 * 1024;
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB per file


export const ALLOWED_CONTENT_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/x-csv',
  'image/jpeg',
  'image/png',
  'application/pdf',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'application/xml',
  'text/xml',
]);

export const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.zip', '.json', '.xml',
];

export const getFileExtension = (name = '') => {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
};

/** Client-side pick validation before upload starts. */
export const validateFileForUpload = (file) => {
  if (!file) return { ok: false, message: 'No file selected.' };

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      code: 'file_size',
      message: `"${file.name}" exceeds the 100 MB per-file limit.`,
    };
  }

  const ext = getFileExtension(file.name);
  const mimeOk = file.type && ALLOWED_CONTENT_TYPES.has(file.type);
  const extOk = ext && ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk && !extOk) {
    return {
      ok: false,
      code: 'content_type',
      message: `"${file.name}" — file type not allowed. Supported: PDF, Office, CSV, images, ZIP, JSON, XML, TXT.`,
    };
  }

  return { ok: true };
};

const fieldErrorText = (data, field) => {
  const val = data?.[field];
  if (!val) return '';
  if (Array.isArray(val)) return String(val[0]);
  if (typeof val === 'string') return val;
  return '';
};

/** Errors that must not trigger chunk retry (validation, quota, duplicates). */
export const isNonRetryableUploadError = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!error?.response) return false;

  if (status === 400 || status === 409 || status === 413) return true;

  if (data?.content_type || data?.file_size || data?.file || data?.chunk_index) return true;

  const fileErr = fieldErrorText(data, 'file').toLowerCase();
  if (fileErr.includes('not allowed') || fileErr.includes('file type')) return true;

  const sizeErr = fieldErrorText(data, 'file_size').toLowerCase();
  if (sizeErr.includes('exceeds') || sizeErr.includes('limit')) return true;

  const typeErr = fieldErrorText(data, 'content_type').toLowerCase();
  if (typeErr.includes('not allowed') || typeErr.includes('does not match')) return true;

  const errMsg = typeof data?.error === 'string' ? data.error.toLowerCase() : '';
  if (
    errMsg.includes('not allowed')
    || errMsg.includes('exceeds')
    || errMsg.includes('insufficient storage')
    || errMsg.includes('duplicate')
    || errMsg.includes('cancelled')
    || errMsg.includes('already completed')
  ) {
    return true;
  }

  return false;
};

export const getUploadErrorMessage = (error, fileName = 'file') => {
  const data = error?.response?.data;
  if (!data) return `Network error uploading "${fileName}". You can resume when connected.`;

  return (
    data.error
    || fieldErrorText(data, 'file')
    || fieldErrorText(data, 'content_type')
    || fieldErrorText(data, 'file_size')
    || fieldErrorText(data, 'chunk_index')
    || `Upload failed for "${fileName}".`
  );
};
