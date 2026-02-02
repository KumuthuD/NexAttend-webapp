/**
 * Validation utility functions for form inputs
 */

/**
 * Validates an email address
 * @param email The email string to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validates a password
 * @param password The password string to validate
 * @returns Error message string if invalid, null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  // Optional: Add more strict checks (uppercase, number, special char)
  // for now keeping it simple as per requirements
  
  return null;
};

/**
 * Validates required fields
 * @param value The value to check
 * @param fieldName Name of the field for the error message
 * @returns Error message string if invalid, null if valid
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates a name (allows letters, spaces, hyphens)
 * @param name The name string to validate
 * @returns Error message string if invalid, null if valid
 */
export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  
  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }
  
  const nameRegex = /^[a-zA-Z\s-]+$/;
  if (!nameRegex.test(name)) {
    return 'Name can only contain letters, spaces and hyphens';
  }
  
  return null;
};
