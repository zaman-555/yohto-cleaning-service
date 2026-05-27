import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
const corsAllowedOrigins = [
  clientOrigin,
  'http://192.168.0.169:3000',
  'https://yohto-cleaning-service-dczi.vercel.app',
];

app.use(
  cors({
    origin: corsAllowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use('/api', apiRoutes);

export default app;
