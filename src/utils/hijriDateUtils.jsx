// src/utils/hijriDateUtils.js
import moment from "moment-hijri";

/**
 * Convert Gregorian date to Hijri Qamari
 */
export const convertGregorianToHijri = (gregorianDate) => {
  if (!gregorianDate) return "";
  return moment(gregorianDate).format("iYYYY/iM/iD");
};

/**
 * Convert Hijri Qamari date to Gregorian
 */
export const convertHijriToGregorian = (hijriDate) => {
  if (!hijriDate) return "";
  return moment(hijriDate, "iYYYY/iM/iD").format("YYYY-MM-DD");
};

/**
 * Format date for display (like your friend's code)
 */
export const formatHijriDateForDisplay = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("ar-SA-u-ca-islamic");
  } catch {
    return "N/A";
  }
};

/**
 * Get current Hijri date
 */
export const getCurrentHijriDate = () => {
  return moment().format("iYYYY/iM/iD");
};

/**
 * Format Hijri date with custom format
 */
export const formatHijriDate = (hijriDate, format = "iYYYY/iM/iD") => {
  if (!hijriDate) return "";
  return moment(hijriDate, "iYYYY/iM/iD").format(format);
};

/**
 * Validate Hijri date
 */
export const isValidHijriDate = (hijriDate) => {
  return moment(hijriDate, "iYYYY/iM/iD", true).isValid();
};
export const HIJRI_MONTHS = [
  "محرم",
  "صفر",
  "ربیع الاول",
  "ربیع الثانی",
  "جمادی الاول",
  "جمادی الثانی",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذوالقعده",
  "ذوالحجه",
];

export const getHijriMonthName = (gregorianDateStr) => {
  if (!gregorianDateStr) return null;
  try {
    const m = moment(gregorianDateStr, "YYYY-MM-DD");
    if (!m.isValid()) return null;
    return HIJRI_MONTHS[m.iMonth()];
  } catch {
    return null;
  }
};

/**
 * Convert Gregorian year to Hijri year only (no month/day)
 */
export const getHijriYear = (gregorianYear) => {
  if (!gregorianYear) return "";
  try {
    return moment(`${gregorianYear}-06-01`, "YYYY-MM-DD").iYear();
  } catch {
    return gregorianYear;
  }
};
