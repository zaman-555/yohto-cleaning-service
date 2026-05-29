import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

const app = express();

// Behind a reverse proxy (Vercel/Render/etc.) the client IP is in X-Forwarded-For.
// Trust the configured number of proxy hops so rate limiting keys on the real IP.
// Defaults to 1 hop; set TRUST_PROXY=0 to disable when running without a proxy.
const trustProxyHops = Number(process.env.TRUST_PROXY ?? '1');
app.set('trust proxy', Number.isFinite(trustProxyHops) ? trustProxyHops : 1);

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
