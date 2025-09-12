/**
 * Validates if a string is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates if a password meets the minimum requirements
 * @param {string} password - The password to validate
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validates if two password fields match
 * @param {string} password - The first password
 * @param {string} confirmPassword - The password confirmation
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match',
    };
  }
  return { isValid: true, message: 'Passwords match' };
};

/**
 * Validates if a string is not empty
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field being validated
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }
  return { isValid: true, message: `${fieldName} is valid` };
};

/**
 * Validates if a string has a minimum length
 * @param {string} value - The value to validate
 * @param {number} minLength - The minimum required length
 * @param {string} fieldName - The name of the field being validated
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters long`,
    };
  }
  return { isValid: true, message: `${fieldName} is valid` };
};

/**
 * Validates if a string contains only letters and spaces
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field being validated
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validateLettersOnly = (value, fieldName) => {
  const re = /^[A-Za-z\s]+$/;
  if (!re.test(value)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters and spaces`,
    };
  }
  return { isValid: true, message: `${fieldName} is valid` };
};

/**
 * Validates a form field based on its type and constraints
 * @param {string} type - The type of the field (email, password, text, etc.)
 * @param {string} value - The value to validate
 * @param {Object} constraints - Additional constraints for validation
 * @returns {{isValid: boolean, message: string}} Validation result with message
 */
export const validateField = (type, value, constraints = {}) => {
  const { fieldName, minLength, required = true } = constraints;
  
  // Skip validation for optional empty fields
  if (!required && (!value || value.trim() === '')) {
    return { isValid: true, message: '' };
  }

  // Check required fields
  if (required) {
    const requiredValidation = validateRequired(value, fieldName || 'This field');
    if (!requiredValidation.isValid) {
      return requiredValidation;
    }
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      if (!validateEmail(value)) {
        return { isValid: false, message: 'Please enter a valid email address' };
      }
      break;
    
    case 'password':
      if (minLength) {
        const minLengthValidation = validateMinLength(value, minLength, fieldName || 'Password');
        if (!minLengthValidation.isValid) {
          return minLengthValidation;
        }
      }
      return validatePassword(value);
    
    case 'text':
      if (constraints.lettersOnly) {
        return validateLettersOnly(value, fieldName || 'This field');
      }
      if (minLength) {
        return validateMinLength(value, minLength, fieldName || 'This field');
      }
      break;
    
    default:
      break;
  }

  return { isValid: true, message: 'Validation passed' };
};
