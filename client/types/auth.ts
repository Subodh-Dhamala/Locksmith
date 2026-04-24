import { User } from "./user";

export type AuthResponse = {
  accessToken: string;
  user: User;
  requiresTwoFactor?: boolean;
  userId?: string;
};

export type ApiError = {
  message: string;
};