export function formatMessageTime(dateVal) {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
