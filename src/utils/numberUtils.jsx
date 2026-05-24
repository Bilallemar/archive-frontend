// src/utils/numberUtils.js

/**
 * Convert Pashto/Dari/Arabic numerals to English numerals
 */
export const convertToEnglishNumbers = (str) => {
  if (!str) return str;

  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = str.toString();

  // Convert Persian/Dari numerals
  persianNumbers.forEach((persianNum, index) => {
    result = result.replace(new RegExp(persianNum, "g"), englishNumbers[index]);
  });

  // Convert Arabic numerals
  arabicNumbers.forEach((arabicNum, index) => {
    result = result.replace(new RegExp(arabicNum, "g"), englishNumbers[index]);
  });

  return result;
};

/**
 * Convert English numerals to Pashto/Dari numerals for display
 */
export const convertToPersianNumbers = (str) => {
  if (!str) return str;

  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = str.toString();

  englishNumbers.forEach((englishNum, index) => {
    result = result.replace(new RegExp(englishNum, "g"), persianNumbers[index]);
  });

  return result;
};
