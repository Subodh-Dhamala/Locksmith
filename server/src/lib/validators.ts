import {z} from 'zod';

const passwordSchema = z
.string()
.min(8,'Password must be at least 8 characters')
.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
.regex(/[0-9]/, 'Password must contain at least one number')
.regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email:z.string().email('Invalid email address'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1,'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data)=>data.newPassword === data.confirmPassword,{
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;