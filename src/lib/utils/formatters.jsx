export const formatDateTime = (publishDate) => {
  if (!publishDate) return null;
  const date = new Date(publishDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `${formattedDate}, ${formattedTime}`;
};
