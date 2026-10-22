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

export const isFieldValid = (
  name: string,
  value: string,
  newPassword?: string,
): boolean => {
  const pattern = Object.hasOwn(patterns, name) ? patterns[name] : undefined;
  if (!pattern) return true;

  return pattern.test(value)
    && (name !== 'confirm_password' || value === newPassword);
};
