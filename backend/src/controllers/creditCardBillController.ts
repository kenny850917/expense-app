// src/controllers/creditCardBillController.ts
import pool from '../db/pool';

// Define types for the credit card bill insertion
type CreditCardBill = {
  credit_card_id: string;
  billing_period_start: string;
  billing_period_end: string;
  total_due: number;
  payment_due_date: string;
};

// Insert a credit card bill and return the inserted `credit_card_bill_id`
export const insertCreditCardBill = async (bill: CreditCardBill): Promise<string | null> => {
  try {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO credit_card_bills 
      (credit_card_id, billing_period_start, billing_period_end, total_due, payment_due_date) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [bill.credit_card_id, bill.billing_period_start, bill.billing_period_end, bill.total_due, bill.payment_due_date]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error inserting credit card bill:', error);
    return null;
  }
};
