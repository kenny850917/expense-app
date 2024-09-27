// src/controllers/userController.ts
import { Request, Response } from 'express';
import { getAllUsers, getCreditCardsForUser, getBankAccountsForUser } from '../helpers/dbHelpers';

// Fetch all users
export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Fetch credit cards for a user
export const fetchCreditCards = async (req: Request, res: Response) => {
  const { userId } = req.query;
  console.log('userid',userId)

  try {
    const creditCards = await getCreditCardsForUser(userId as string);
    res.status(200).json(creditCards);
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    res.status(500).json({ message: 'Error fetching credit cards' });
  }
};

// Fetch bank types
export const fetchBanks = async (req: Request, res: Response) => {
    const { userId } = req.query;  // Assuming userId is passed as a route parameter
  
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }
  
    try {
      const banks = await getBankAccountsForUser(userId as string);  // Pass the userId to the function
      res.status(200).json(banks);
    } catch (error) {
      console.error('Error fetching bank accounts for user:', error);
      res.status(500).json({ message: 'Error fetching bank accounts' });
    }
  };
