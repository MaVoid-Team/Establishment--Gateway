// src/utils/formatting.js

/**
 * Mapping of currency codes to their RTL equivalents.
 * Extend this mapping as needed for other currencies and locales.
 */
const currencyMap = {
    ar: {
      SAR: 'ر.س',
    },
    // Add more locale-specific mappings if needed
  };
  
  /**
   * Formats a number with K, M, B suffixes using 'compact' notation and translates the currency code based on locale.
   * @param {number} value - The numeric value to format.
   * @param {string} locale - The locale string (e.g., 'en-US', 'ar').
   * @param {string} currency - The currency code (default: 'SAR').
   * @returns {string} - Formatted string with currency and suffix.
   */
  export const formatCurrencyWithSuffix = (value, locale, currency = 'SAR') => {
    if (typeof value !== 'number') return value || 'N/A';
  
    // Handle zero separately to avoid 'compact' notation
    if (value === 0) {
      const zeroFormatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'code', // Ensures 'SAR' is used instead of the symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      let formattedZero = zeroFormatter.format(value); // e.g., 'SAR 0.00'
  
      // Translate currency code if in RTL locale
      const languageCode = locale.split('-')[0];
      if (currencyMap[languageCode] && currencyMap[languageCode][currency]) {
        formattedZero = formattedZero.replace(currency, currencyMap[languageCode][currency]);
      }
  
      return formattedZero; // e.g., '0.00 ر.س'
    }
  
    // Use 'compact' notation for values >= 1000
    const numberFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'code', // Ensures 'SAR' is used instead of the symbol
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  
    let formattedNumber = numberFormatter.format(value); // e.g., 'SAR 2.6M' or 'SAR 8.7M'
  
    // Determine if the locale is RTL
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    const languageCode = locale.split('-')[0];
    const isRTL = rtlLocales.includes(languageCode);
  
    // Translate currency code if in RTL locale
    if (isRTL && currencyMap[languageCode] && currencyMap[languageCode][currency]) {
      formattedNumber = formattedNumber.replace(currency, currencyMap[languageCode][currency]); // e.g., '2.6M ر.س'
    }
  
    return formattedNumber; // e.g., 'SAR 2.6M' or '2.6M ر.س'
  };
  
  /**
   * Formats a date string according to the locale.
   * @param {string} dateString - The date string to format.
   * @param {string} locale - The locale string.
   * @returns {string} - Formatted date string.
   */
  export const formatDate = (dateString, locale) => {
    if (!dateString) return 'N/A';
  
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };
  