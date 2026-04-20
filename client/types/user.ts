export type Role = "USER" | "ADMIN" | "MODERATOR";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};