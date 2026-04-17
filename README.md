# Auth Backend API

A secure, production-ready authentication backend built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, and **Passport.js**.

This project implements a complete authentication system including JWT rotation, OAuth login, role-based access control (RBAC), password reset, and two-factor authentication (2FA).

---
## Features

### Authentication & Authorization
- User registration with email verification flow
- Secure login with bcrypt password hashing
- JWT system with access and refresh token rotation
- Role-based access control (USER, MODERATOR, ADMIN)

### Security & 2FA
- Two-factor authentication (TOTP) using Google Authenticator
- QR code-based setup for 2FA
- Rate limiting (strict and loose modes)
- Account lockout after multiple failed login attempts
- Input validation using Zod

### OAuth 2.0
- Google and GitHub OAuth login
- Automatic account creation
- Account linking via email

---
## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js (Express + TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Passport.js, JWT, bcrypt |
| 2FA | Speakeasy, QRCode |
| Validation | Zod |

---

## Project Structure

```bash
src/
├── controller/   # Request handlers
├── routes/       # API route definitions
├── middlewares/  # Auth, RBAC, error handling
├── lib/          # Shared utilities (Prisma, Passport config)
├── services/     # Business logic (auth, email, tokens)
├── types/        # TypeScript types and enums
├── app.ts        # Application entry point

prisma/           # Database schema and migrations

```
## API Routes

### Authentication

| Method | Route | Description |
|--------|------|-------------|
| POST | /auth/register | Register user |
| GET | /auth/verify-email/:token | Verify email |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh token rotation |
| POST | /auth/logout | Logout user |

---

### Two-Factor Authentication (2FA)

| Method | Route | Description |
|--------|------|-------------|
| POST | /auth/2fa/enable | Generate 2FA secret and QR code |
| POST | /auth/2fa/verify | Verify OTP and enable 2FA |
| POST | /auth/2fa/login | Verify OTP during login |

---

### User & Admin

| Method | Route | Description |
|--------|------|-------------|
| GET | /user/me | Get current user profile |
| PUT | /admin/users/:id/role | Update user role (Admin only) |
| DELETE | /admin/users/:id | Delete user (Admin only) |

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Supabase - pooled connection)
DATABASE_URL="xxx"

# Direct DB connection (migrations)
DIRECT_URL="xxx"

# JWT
JWT_SECRET="xxx"
JWT_REFRESH_SECRET="xxx"
JWT_EXPIRES_IN="xxx"
JWT_REFRESH_EXPIRES_IN="xxx"

# App config
NODE_ENV="development"
PORT=3000
LOG_LEVEL="debug"
CLIENT_URL="http://localhost:3000"

# SMTP (SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="REPLACE_WITH_SECRET"
SMTP_FROM="xxx"

# Google OAuth
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# GitHub OAuth
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"
GITHUB_CALLBACK_URL="http://localhost:3000/auth/github/callback"

```
## Status

- Authentication system complete
- JWT and refresh tokens implemented
- OAuth (Google and GitHub) implemented
- Password reset system implemented
- Role-based access control implemented
- Two-factor authentication (TOTP) implemented
- Production-level architecture

---

## Final Note

This backend is already production-ready (90–95%).

Remaining improvements:
- Scaling (Redis, sessions)
- Security polishing
- Monitoring and logging enhancements

