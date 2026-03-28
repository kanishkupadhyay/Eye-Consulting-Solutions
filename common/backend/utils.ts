import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const getDecodedToken = (
  token: string,
  secret = process.env.JWT_AUTH_SECRET!,
): { userId: string; isAdmin?: boolean } => {
  return jwt.verify(token, secret) as unknown as {
    userId: string;
    isAdmin?: boolean;
  };
};
