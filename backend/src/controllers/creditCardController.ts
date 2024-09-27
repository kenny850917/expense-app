import { Request, Response } from 'express';
import pool from '../db/pool';

// Define types for the request body (TypeScript)
type CreateCreditCardBody = {
  user_id: string;
  card_name: string;
  card_type: string;
};

// Create a new credit card
export const createCreditCard = async (req: Request, res: Response): Promise<void> => {
  const { user_id, card_name, card_type }: CreateCreditCardBody = req.body;
  console.log('userid', user_id, card_name, card_type)

  // Validate request body
  if (!user_id || !card_name || !card_type) {
    res.status(400).json({ message: 'Missing required fields: user_id, card_name, or card_type' });
    return;
  }

  // SQL query to insert the new credit card
  const query = `
    INSERT INTO credit_cards (id, user_id, card_name, card_type)
    VALUES (uuid_generate_v4(), $1, $2, $3)
    RETURNING id, user_id, card_name, card_type, created_at;
  `;

  try {
    // Execute the query
    const result = await pool.query(query, [user_id, card_name, card_type]);

    // Send back the newly created credit card data
    res.status(201).json({
      message: 'Credit card created successfully',
      credit_card: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating credit card:', error);
    res.status(500).json({ message: 'Error creating credit card' });
  }
};
