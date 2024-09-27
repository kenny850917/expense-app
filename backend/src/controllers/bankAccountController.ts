import { Request, Response } from 'express';
import pool from '../db/pool';

// Define types for the request body
type CreateBankAccountBody = {
  user_id: string;
  account_name: string;
  account_type: 'chequing' | 'savings';  // Restrict to specific types
  balance?: number;  // Optional, with a default value of 0.00
};

// Controller to insert a new bank account
export const bankAccount = async (req: Request, res: Response): Promise<void> => {
  const { user_id, account_name, account_type, balance }: CreateBankAccountBody = req.body;

  // Log the received data
  console.log('Creating bank account with data:', { user_id, account_name, account_type, balance });

  // Validate required fields
  if (!user_id || !account_name || !account_type) {
    res.status(400).json({ message: 'Missing required fields: user_id, account_name, or account_type' });
    return;
  }

  const query = `
    INSERT INTO bank_accounts (id, user_id, account_name, account_type, balance)
    VALUES (uuid_generate_v4(), $1, $2, $3, $4)
    RETURNING id, user_id, account_name, account_type, balance, created_at;
  `;

  try {
    // Execute the query to insert the bank account
    const result = await pool.query(query, [
      user_id,
      account_name,
      account_type,
      balance ?? 0.00,  // Use default value of 0.00 if balance is not provided
    ]);

    // Send the newly created bank account data as the response
    res.status(201).json({
      message: 'Bank account created successfully',
      bank_account: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ message: 'Error creating bank account' });
  }
};
