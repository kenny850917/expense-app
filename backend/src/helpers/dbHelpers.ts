import pool from '../db/pool';

// Insert or get cardholder
export async function insertOrGetCardholder(cardholderName: string, creditCardId: string, userId: string) {
  try {
    const result = await pool.query(
      'SELECT id FROM cardholders WHERE cardholder_name = $1 AND credit_card_id = $2',
      [cardholderName, creditCardId]
    );
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      const insertResult = await pool.query(
        'INSERT INTO cardholders (user_id, credit_card_id, cardholder_name) VALUES ($1, $2, $3) RETURNING id',
        [userId, creditCardId, cardholderName]
      );
      return insertResult.rows[0].id;
    }
  } catch (err) {
    console.error('Error inserting or getting cardholder:', err);
    throw err;
  }
}

// Insert expense
export async function insertExpense(cardholderId: string, expenseName: string, amount: number, expenseDate: string, creditCardId: string, userId: string,credit_card_bill_id:string) {
  try {
    const result = await pool.query(
      'INSERT INTO expenses (cardholder_id, expense_name, amount, expense_date, credit_card_id, user_id, credit_card_bill_id) VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING *',
      [cardholderId, expenseName, amount, expenseDate, creditCardId,userId,credit_card_bill_id]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting expense:', err);
    throw err;
  }
}
