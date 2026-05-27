import dotenv from 'dotenv';

dotenv.config();

import './types/express';
import app from './app';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
