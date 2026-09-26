import dotenv from 'dotenv';
import { setDefaultResultOrder } from 'node:dns';
import path from 'path';

// Explicitly load .env from the server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// This host advertises IPv6 DNS records but has no working IPv6 route.
// Prefer IPv4 so transactional email requests reach Resend reliably.
setDefaultResultOrder('ipv4first');

import './types/express';
import app from './app';

const port = Number(process.env.PORT) || 5000;
const host =
  process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0');

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`Environment loaded from: ${path.join(__dirname, '../.env')}`);
  console.log(`Admin email configured: ${process.env.ADMIN_EMAIL ? 'Yes' : 'No'}`);
});