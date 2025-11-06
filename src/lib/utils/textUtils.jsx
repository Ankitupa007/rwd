import he from "he";

export const decodeHtmlEntities = (text) => {
  return he.decode(text);
};
