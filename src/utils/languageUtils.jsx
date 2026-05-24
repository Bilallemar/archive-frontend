// src/utils/languageUtils.js
const RTL_LANGUAGES = ["ps", "fa", "ar", "ur", "he"];

export const isRTLLanguage = (language) => {
  return RTL_LANGUAGES.includes(language);
};

export const setDocumentDirection = (language) => {
  const direction = isRTLLanguage(language) ? "rtl" : "ltr";

  // Set on HTML element
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", language);

  // Set on body
  document.body.setAttribute("dir", direction);
  document.body.style.direction = direction;

  // Add font class for RTL languages
  if (direction === "rtl") {
    document.body.classList.add("rtl-font");
  } else {
    document.body.classList.remove("rtl-font");
  }

  // Set on document
  document.dir = direction;

  // Save to localStorage
  localStorage.setItem("app-direction", direction);
  localStorage.setItem("app-language", language);

  console.log(`✅ Direction: ${direction}, Language: ${language}`);
  return direction;
};

export const getStoredLanguage = () => {
  return localStorage.getItem("app-language") || "ps";
};

export const getStoredDirection = () => {
  return localStorage.getItem("app-direction") || "rtl";
};

export const initializeDirection = () => {
  const storedLanguage = getStoredLanguage();
  const direction = setDocumentDirection(storedLanguage);
  return { language: storedLanguage, direction };
};
