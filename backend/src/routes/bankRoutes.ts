import express from 'express';
import { bankAccount } from '../controllers/bankAccountController';

const router = express.Router();

router.post('/create', bankAccount);

export default router;
