export const textUpper = (text: string) => {
  return text.toUpperCase();
};

export const textLower = (text: string) => {
  return text.toLowerCase();
};

export const textCapitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
