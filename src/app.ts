import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

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

app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;