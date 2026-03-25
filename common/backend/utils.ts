import bcrypt from 'bcryptjs';

export const createHashPassword = async (
  password: string,
  saltRounds = 10,
): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
};

export const checkIsValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
