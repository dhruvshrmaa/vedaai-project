import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import assignmentRoutes from './routes/assignment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/assignments', assignmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'VedaAI Backend Running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;