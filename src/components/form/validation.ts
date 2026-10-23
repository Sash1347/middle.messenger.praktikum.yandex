const namePattern = /^[A-Z\u0410-\u042f\u0401][A-Za-z\u0410-\u044f\u0401\u0451-]*$/;
const passwordPattern = /^(?=.*\d)(?=.*[A-Z]).{8,40}$/;

const patterns: Record<string, RegExp> = {
  first_name: namePattern,
  second_name: namePattern,
  login: /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/,
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?=[a-zA-Z0-9-]*[a-zA-Z])[a-zA-Z0-9-]+\.[a-zA-Z]+(?:\.[a-zA-Z]+)*$/,
  password: passwordPattern,
  old_password: passwordPattern,
  new_password: passwordPattern,
  confirm_password: passwordPattern,
  phone: /^\+?\d{10,15}$/,
  message: /\S/,
};

const nameError = 'Use Latin or Cyrillic letters and hyphens, starting with a capital letter. Spaces and digits are not allowed.';
const passwordError = 'Use 8-40 characters, including at least one capital Latin letter and one digit. Line breaks are not allowed.';

const errorMessages: Record<string, string> = {
  first_name: nameError,
  second_name: nameError,
  login: 'Use 3-20 Latin letters, digits, hyphens or underscores, including at least one letter. Spaces are not allowed.',
  email: 'Enter an email address such as name@example.com, using Latin letters.',
  password: passwordError,
  old_password: passwordError,
  new_password: passwordError,
  confirm_password: passwordError,
  phone: 'Enter 10-15 digits, optionally starting with +. Spaces, brackets and hyphens are not allowed.',
  message: 'Enter a message containing at least one non-space character.',
};

export const getFieldError = (
  name: string,
  value: string,
  newPassword?: string,
): string | null => {
  const pattern = Object.hasOwn(patterns, name) ? patterns[name] : undefined;
  if (!pattern) return null;
  if (!value) return 'Please fill out this field.';
  if (!pattern.test(value)) return errorMessages[name];
  if (name === 'confirm_password' && value !== newPassword) {
    return 'Passwords do not match. Enter the same password as in New Password.';
  }
  return null;
};

export const isFieldValid = (
  name: string,
  value: string,
  newPassword?: string,
): boolean => {
  return getFieldError(name, value, newPassword) === null;
};
