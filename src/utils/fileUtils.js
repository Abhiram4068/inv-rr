export const getFileVisuals = (input) => {
  if (!input) return { color: "#808080", icon: "fa-file" };

  // Convert to lowercase for consistent matching
  const lowInput = input.toLowerCase();

  // 1. Check for MIME types (Content-Type) first
  if (lowInput.includes('image/')) return { color: "#e91e63", icon: "fa-file-image" };
  if (lowInput.includes('video/')) return { color: "#ff3547", icon: "fa-file-video" };
  if (lowInput.includes('audio/')) return { color: "#9c27b0", icon: "fa-file-audio" };
  if (lowInput.includes('application/pdf')) return { color: "#ff4444", icon: "fa-file-pdf" };
  if (lowInput.includes('zip') || lowInput.includes('compressed')) return { color: "#ffa900", icon: "fa-file-zipper" };

  // 2. Fallback to Extension mapping (for filenames)
  const ext = lowInput.split('.').pop();
  const map = {
    pdf: { color: "#ff4444", icon: "fa-file-pdf" },
    xlsx: { color: "#00c851", icon: "fa-file-excel" },
    xls: { color: "#00c851", icon: "fa-file-excel" },
    docx: { color: "#3b82f6", icon: "fa-file-word" },
    doc: { color: "#3b82f6", icon: "fa-file-word" },
    zip: { color: "#ffa900", icon: "fa-file-zipper" },
    rar: { color: "#ffa900", icon: "fa-file-zipper" },
    mp4: { color: "#ff3547", icon: "fa-file-video" },
    mov: { color: "#ff3547", icon: "fa-file-video" },
    md: { color: "#a66efa", icon: "fa-file-code" },
    js: { color: "#a66efa", icon: "fa-file-code" },
    png: { color: "#e91e63", icon: "fa-file-image" },
    jpg: { color: "#e91e63", icon: "fa-file-image" },
    jpeg: { color: "#e91e63", icon: "fa-file-image" },
  };

  return map[ext] || { color: "#808080", icon: "fa-file" };
};