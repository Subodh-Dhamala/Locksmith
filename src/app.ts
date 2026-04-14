import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes';
import passwordRoutes from './routes/passwordRoutes';
import userRoutes from './routes/userRoutes';

import { errorMiddleware } from './middlewares/errorMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';

import adminRoutes from './routes/adminRoutes';
import moderatorRoutes from './routes/moderatorRoutes';

function validateEnv(): void {
  const required: string[] = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
  }
}

validateEnv();

const app: Application = express();
app.use(express.json());
app.use(cookieParser());

//routes
app.use('/auth',authRoutes);
app.use('/auth/password',passwordRoutes);
app.use('/user',userRoutes);

app.use('/user', authMiddleware, userRoutes);

app.use('/admin', adminRoutes);
app.use('/moderator', moderatorRoutes);

app.get("/", (req, res) => {
  res.send("PaleyDai is Active!");
});

app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

app.use(errorMiddleware);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;