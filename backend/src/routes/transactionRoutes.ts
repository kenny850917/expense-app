import express, { Request, Response } from 'express';
import pool from '../db/pool';  // Assuming you have a pool setup for PostgreSQL

const router = express.Router();

// Endpoint to get total amount spent by cardholders for a specific user, filtered by date range
router.get('/cardholder-amounts/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;  // Get startDate and endDate from query parameters

  let query = `
    SELECT 
      c.cardholder_name, 
      SUM(e.amount) AS total_amount_spent
    FROM 
      expenses e
    JOIN 
      cardholders c ON e.cardholder_id = c.id
    JOIN 
      credit_cards cc ON c.credit_card_id = cc.id
    JOIN 
      users u ON cc.user_id = u.id
    WHERE 
      u.id = $1
  `;

  const params: any[] = [userId];

  // Apply date range filter if startDate and endDate are provided
  if (startDate && endDate) {
    query += ` AND e.expense_date BETWEEN $2 AND $3`;
    params.push(startDate, endDate);
  }

  query += ` GROUP BY c.cardholder_name`;

  try {
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No cardholders found for this user.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cardholder amounts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get detailed transactions for a user filtered by date range
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;  // Get startDate and endDate from query parameters

  let query = `
    SELECT 
      e.expense_name, 
      e.amount, 
      e.expense_date, 
      c.cardholder_name 
    FROM 
      expenses e
    JOIN 
      cardholders c ON e.cardholder_id = c.id
    JOIN 
      credit_cards cc ON c.credit_card_id = cc.id
    JOIN 
      users u ON cc.user_id = u.id
    WHERE 
      u.id = $1
  `;

  const params: any[] = [userId];

  // Apply date range filter if startDate and endDate are provided
  if (startDate && endDate) {
    query += ` AND e.expense_date BETWEEN $2 AND $3`;
    params.push(startDate, endDate);
  }

  try {
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No transactions found for this user in the selected date range.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
