// src/utils.js
export const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const lat1InRad = toRadians(lat1);
  const lat2InRad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1InRad) *
      Math.cos(lat2InRad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG = 111.32;

export const getGeoBoundingBox = (latitude, longitude, radiusKm) => {
  const deltaLat = radiusKm / KM_PER_DEG_LAT;
  const deltaLng =
    radiusKm / (KM_PER_DEG_LNG * Math.cos((Math.PI * latitude) / 180));

  return {
    minLat: latitude - deltaLat,
    maxLat: latitude + deltaLat,
    minLng: longitude - deltaLng,
    maxLng: longitude + deltaLng,
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const toCityName = (str) => {
  const cleanName = str.replaceAll("-", " ");

  return cleanName?.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
};

export const generateShareLinks = (latitude, longitude) => {
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const wazeLink = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  const appleMapsLink = `http://maps.apple.com/?q=${latitude},${longitude}`;

  return { googleMapsLink, wazeLink, appleMapsLink };
};

/// src/utils.js

// Checksum validation for CPF
const validateCPF = (cpf) => {
  if (
    cpf.length !== 11 ||
    [
      "00000000000",
      "11111111111",
      "22222222222",
      "33333333333",
      "44444444444",
      "55555555555",
      "66666666666",
      "77777777777",
      "88888888888",
      "99999999999",
    ].includes(cpf)
  ) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(9))) {
    return false;
  }
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) {
    resto = 0;
  }
  if (resto !== parseInt(cpf.charAt(10))) {
    return false;
  }
  return true;
};

// Basic RG format validation
const validateRG = (rg) => {
  // Clean up formatting (numbers only)
  rg = rg.replace(/\D/g, "");

  // Validate length (usually between 8 and 9 digits, but varies)
  return rg.length >= 8 || rg.length <= 10;
};

// Unified function to validate RG or CPF
export const validateDocument = (doc) => {
  // Determine whether this is a CPF or RG based on length
  const cleanDoc = doc.replace(/\D/g, "");

  if (cleanDoc.length === 11) {
    // CPF expected
    return validateCPF(cleanDoc);
  } else if (cleanDoc.length >= 8 || cleanDoc.length <= 10) {
    // RG expected
    return validateRG(cleanDoc);
  } else {
    // Invalid length
    return false;
  }
};
