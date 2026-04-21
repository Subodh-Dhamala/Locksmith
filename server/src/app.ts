import express, { Application, Request, Response } from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import passwordRoutes from './routes/passwordRoutes';
import userRoutes from './routes/userRoutes';

import adminRoutes from './routes/adminRoutes';
import moderatorRoutes from './routes/moderatorRoutes';

import { errorMiddleware } from './middlewares/errorMiddleware';

import passport from 'passport';
import './lib/passport';


function validateEnv(): void {
  const required: string[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }
}

validateEnv();

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

//routes
app.use('/auth', authRoutes);
app.use('/auth/password', passwordRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/moderator', moderatorRoutes);

app.get("/", (req, res) => {
  res.send("PaleyDai is Active!");
});

app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

//error handler
app.use(errorMiddleware);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;