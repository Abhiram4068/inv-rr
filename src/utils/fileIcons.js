export const getFileMeta = (contentType = "") => {
  const type = contentType.toLowerCase();

  // PDF
  if (type.includes("pdf")) {
    return {
      icon: "fa-file-pdf",
      color: "#ef4444",
      canPreview: true,
      category: "pdf"
    };
  }

  // Word (doc, docx)
  if (type.includes("word") || type.includes("document")) {
    return {
      icon: "fa-file-word",
      color: "#3b82f6", // blue
      canPreview: false,
      category: "doc",
      
    };
  }

  // Excel
  if (type.includes("excel") || type.includes("spreadsheet") || type.includes("sheet")) {
    return {
      icon: "fa-file-excel",
      color: "#22c55e",
      canPreview: false,
      category: "excel"
    };
  }

  // Images
  if (type.startsWith("image/")) {
    return {
      icon: "fa-file-image",
      color: "#22c55e",
      canPreview: true,
      category: "image"
    };
  }

  // Video
  if (type.startsWith("video/")) {
    return {
      icon: "fa-file-video",
      color: "#a855f7",
      canPreview: false,
      category: "video"
    };
  }
    // Video
  if (type.startsWith("application/")) {
    return {
      icon: "fa-file-lines",
      color: "#ffffffff",
      canPreview: false,
      category: "application",
       fontSize: "64px",
       transform: "rotate(-10deg)"
    };
  }

  return {
    icon: "fa-file",
    color: "#9ca3af",
    canPreview: false,
    category: "other"
  };
};