export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const formatted = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);

  return formatted.replace(/\b(am|pm)\b/g, (match) => match.toUpperCase());
};