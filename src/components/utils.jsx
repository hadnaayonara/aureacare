export const ensureArray = (value) => {
  // Handle null, undefined, or falsy values
  if (!value) return [];
  
  // If it's already an array, filter out any invalid entries
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined);
  }
  
  // If it's a single value, wrap it in an array
  return [value];
};

// Safe array operations to prevent iteration errors
export const safeSpread = (value) => {
  const arr = ensureArray(value);
  return arr.length > 0 ? [...arr] : [];
};

export const safeArrayFrom = (value) => {
  if (!value) return [];
  try {
    return Array.from(value).filter(Boolean);
  } catch (error) {
    console.warn('safeArrayFrom: Could not convert to array:', value);
    return [];
  }
};

// Safe object spread to prevent undefined errors
export const safeObjectSpread = (obj) => {
  return obj && typeof obj === 'object' ? { ...obj } : {};
};