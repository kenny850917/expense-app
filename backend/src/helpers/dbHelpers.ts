import pool from '../db/pool';

// Function to get the user's name from the users table based on user_id
export const getUserName = async (userId: string): Promise<string | null> => {
  try {
    const result = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 ? result.rows[0].name : null;
  } catch (error) {
    console.error('Error fetching user name:', error);
    return null;
  }
};

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
export async function insertExpense(cardholderId: string, expenseName: string, amount: number, expenseDate: string, creditCardId: string, userId: string,credit_card_bill_id:string, bank:string) {
  try {
    const result = await pool.query(
      'INSERT INTO expenses (cardholder_id, expense_name, amount, expense_date, credit_card_id, user_id, credit_card_bill_id,bank) VALUES ($1, $2, $3, $4, $5,$6,$7,$8) RETURNING *',
      [cardholderId, expenseName, amount, expenseDate, creditCardId,userId,credit_card_bill_id,bank]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting expense:', err);
    throw err;
  }
}

// Fetch all users
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const result = await pool.query('SELECT id, name FROM users');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch all credit cards for a specific user
export const getCreditCardsForUser = async (userId: string): Promise<any[]> => {
  try {
    const result = await pool.query('SELECT id, card_name FROM credit_cards WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    throw error;
  }
};

// Fetch all bank accounts for a specific user
export const getBankAccountsForUser = async (userId: string): Promise<any[]> => {
  try {
    const result = await pool.query('SELECT id, account_name, account_type FROM bank_accounts WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching bank accounts for user:', error);
    throw error;
  }
};


