import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import transactionRoutes from './routes/transactionRoutes'
import creditcardRoute from './routes/creditCardRoutes'
import userRoutes from './routes/userRoutes'
import bankAccount from './routes/bankRoutes'



// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Routes
app.use('/expenses', uploadRoutes);
app.use(transactionRoutes);
app.use('/creditcard',creditcardRoute);
app.use(userRoutes)
app.use('/bank-account',bankAccount)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
