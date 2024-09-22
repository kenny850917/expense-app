import express from 'express';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/expenses', expenseRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
