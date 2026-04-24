# Locksmith (PaleyDai)  - A Full Stack Authentication System. 

A production-ready full-stack authentication system built with Next.js 14, Node.js, Express, TypeScript, Prisma, and PostgreSQL.

---

## Features

### Authentication
- Email/password registration with email verification
- Secure login with bcrypt password hashing
- JWT access + refresh token rotation
- Session restore on page refresh via httpOnly cookie
- Forgot password and reset password via email
- Show/hide password toggle

### OAuth 2.0
- Google and GitHub OAuth login
- Automatic account creation on first OAuth login
- Account linking via email

### Two-Factor Authentication
- TOTP-based 2FA compatible with Google Authenticator and Authy
- QR code setup flow in settings page
- 6-digit OTP verification at login

### Security
- Access token stored in React memory only — never localStorage or sessionStorage
- Refresh token stored in httpOnly cookie
- Automatic 401 retry with token refresh
- Rate limiting in strict and loose modes
- Account lockout after repeated failed login attempts
- Input validation with Zod
- Role-based access control — USER, MODERATOR, ADMIN

---

## Tech Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | React Context |

### Backend
| Category | Technology |
|----------|------------|
| Runtime | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Passport.js + JWT + bcrypt |
| 2FA | Speakeasy + QRCode |
| Email | Nodemailer + SendGrid |
| Validation | Zod |

## API Routes

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register user |
| GET | /auth/verify-email/:token | Verify email address |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh token rotation |
| POST | /auth/logout | Logout user |
| GET | /auth/google | Google OAuth login |
| GET | /auth/github | GitHub OAuth login |

### Password
| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/password/forgot-password | Send reset email |
| POST | /auth/password/reset-password/:token | Reset password |

### Two-Factor Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/2fa/enable | Generate QR code and secret |
| POST | /auth/2fa/verify-setup | Confirm code and enable 2FA |
| POST | /auth/2fa/login | Verify OTP at login |

### User
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | /user/me | Get current user profile | Authenticated |
| PUT | /user/me | Update profile | Authenticated |
| PUT | /user/me/password | Change password | Authenticated |

### Admin
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | /admin/users | Get all users (paginated) | ADMIN |
| PUT | /admin/users/:id/role | Update user role | ADMIN |
| DELETE | /admin/users/:id | Delete user | ADMIN |

### Moderator
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | /moderator/users | View all users read only | ADMIN, MODERATOR |

---

## Environment Variables

### Backend — server/.env
```env
DATABASE_URL=""
DIRECT_URL=""

JWT_SECRET=""
JWT_REFRESH_SECRET=""
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=5000
CLIENT_URL="http://localhost:3000"

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS=""
SMTP_FROM=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:5000/auth/google/callback"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:5000/auth/github/callback"
```

### Frontend — client/.env.local
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

---

## Getting Started

### Backend
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## Architecture Notes

**Token strategy** — Access token lives in React useState (memory only). Refresh token lives in an httpOnly cookie. Neither ever touches localStorage or sessionStorage. On page refresh, AuthProvider calls /auth/refresh to silently restore the session before rendering anything.

**Three-layer architecture** — UI components call hooks only. AuthProvider owns all auth state and calls lib/api.ts. lib/api.ts is the only file that contains fetch(). No exceptions.

**Circular dependency fix** — lib/auth.ts is a plain JS module with no React imports. It holds the access token in a module-level variable. AuthProvider writes to it via setTokenRef(). lib/api.ts reads from it via getToken(). This breaks the circular dependency between AuthProvider and lib/api.ts without any hacks.

**401 retry flow** — Every authenticated request via authRequest() automatically retries once after refreshing the token if a 401 is received. If the retry also fails, the user is logged out silently and redirected to login.

---

## Status

- Full-stack auth system complete
- OAuth (Google + GitHub)
- JWT rotation + session restore
- Email verification
- Password reset flow
- Two-factor authentication (TOTP)
- Role-based UI (ADMIN / MODERATOR / USER)
- Settings page (profile, password, 2FA)
- Production-level architecture

### Possible future improvements
- Redis for refresh token storage and session management
- Email change with re-verification flow
- Disable 2FA flow
- Activity log and session management
- Monitoring and alerting
