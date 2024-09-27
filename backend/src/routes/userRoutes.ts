import express from 'express';
import { fetchUsers, fetchCreditCards, fetchBanks } from '../controllers/userController';

const router = express.Router();

router.get('/users', fetchUsers);
router.get('/credit_cards', fetchCreditCards);
router.get('/banks', fetchBanks);

export default router;
