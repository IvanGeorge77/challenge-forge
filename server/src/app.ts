import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler';
import challengeRoutes from './routes/challenge.routes';
import taskRoutes from './routes/task.routes';
import dailyRoutes from './routes/daily.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import reportRoutes from './routes/report.routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/challenges', taskRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/challenges', reportRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
