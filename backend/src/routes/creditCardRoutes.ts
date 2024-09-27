import express from 'express';
import { createCreditCard } from '../controllers/creditCardController';

const router = express.Router();

// POST route to create a new credit card
router.post('/create', createCreditCard);

export default router;
