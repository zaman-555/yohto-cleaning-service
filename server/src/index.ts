import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import './types/express';
import app from './app';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment loaded from: ${path.join(__dirname, '../.env')}`);
  // Debug: Check if critical env vars are loaded (remove in production)
  console.log(`Admin email configured: ${process.env.ADMIN_EMAIL ? 'Yes' : 'No'}`);
});