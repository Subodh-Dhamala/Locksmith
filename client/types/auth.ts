import { User } from "./user";

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type ApiError = {
  message: string;
};