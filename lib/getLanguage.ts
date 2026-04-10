export function getSavedLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("interfaceLanguage") || "en";
}
