import express from 'express';
import { createServer } from 'http';
import { app } from './app';
import 'dotenv/config';
import { logger } from './utils/logger';

const PORT = env.PORT || 3000;

const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
});