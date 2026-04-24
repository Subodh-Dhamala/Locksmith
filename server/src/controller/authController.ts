import { Request, Response, NextFunction } from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  enable2FA,
  verifyTwoFactorLogin,
  verifyTwoFactorSetup,
} from "../services/authService";

import { registerSchema, loginSchema } from "../lib/validators";
import AppError from "../lib/AppError";

import { cookieOptions } from '../utils/cookieOptions';

import { getUserById } from '../services/userService';

// enable 2FA
export async function enable2FAController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    if (!user?.id) throw new AppError("Unauthorized", 401);

    const data = await enable2FA(user.id);

    res.json(data);
  } catch (error) {
    next(error);
  }
}

//verify 2fa 
export async function verify2FASetupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { token } = req.body;

    if (!user?.id) throw new AppError("Unauthorized", 401);
    if (!token) throw new AppError("Missing token", 400);

    const result = await verifyTwoFactorSetup(user.id, token);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// 2FA login
export async function twoFactorLoginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      throw new AppError("Missing 2FA credentials", 400);
    }

    const tokens = await verifyTwoFactorLogin(userId, token);
    const user = await getUserById(userId);

    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    res.status(200).json({
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    next(error);
  }
}

// register
export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    await register(result.data);

    res.status(201).json({
      message: "Registration successful. Please verify email.",
    });
  } catch (error) {
    next(error);
  }
}

// verify email
export async function verifyEmailController(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.params.token;

    if (!token) throw new AppError("Token required", 400);

    await verifyEmail(token as any);

    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
}

// login
export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    const { accessToken, refreshToken, requiresTwoFactor, userId } = await login(result.data);

    if (requiresTwoFactor) {
      res.status(200).json({ requiresTwoFactor: true, userId });
      return;
    }

    const user = await getUserById(userId!);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({ 
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    next(error);
  }
}

// logout
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // support both cookie + body
    const refreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token found", 400);
    }

    await logout(refreshToken);

    res.clearCookie("refreshToken", {
      ...cookieOptions,
      maxAge: undefined,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}