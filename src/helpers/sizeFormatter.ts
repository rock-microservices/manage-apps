export const sizeFormatter = (value: number): string => {
  const bytes = value;
  if (typeof bytes !== "number") return "—";
  if (bytes === 0) return "0 Bytes";
  const decimals = 2;

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
