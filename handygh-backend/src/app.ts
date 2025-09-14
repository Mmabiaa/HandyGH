import express from 'express';
import { json, urlencoded } from 'body-parser';
import { createServer } from 'http';
import { initSwagger } from './swagger';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import providerRoutes from './routes/provider.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import messageRoutes from './routes/message.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(rateLimitMiddleware);

// Initialize Swagger
initSwagger(app);

// Route setup
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware
app.use(errorMiddleware);

export { app, server };