import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { insertOrGetCardholder, insertExpense, getUserName } from '../helpers/dbHelpers';  // Import the getUserName helper
import { insertCreditCardBill } from './creditCardBillController';

// Define types for CSVRow based on the bank type
type CSVRow = {
  cardholder: string;
  date: string;
  expense_name: string;
  amount: number;
  bank: string;
};

// Define a generic parsing function type for different banks
type BankCSVParser = (row: any, userId: string) => CSVRow;

// Bank-specific parsing logic (Amex, RBC, Scotia, etc.)
const parseAmexCSV: BankCSVParser = (row, userId) => ({
  cardholder: row['Card Member'] || '',  // Set cardholder as empty initially
  date: row['Date'],
  expense_name: row['Description'],
  amount: parseFloat(row['Amount']),
  bank: 'Amex',
});

const parseRBCCSV: BankCSVParser = (row, userId) => ({
  cardholder: '',  // Assume the user's name is used if no cardholder appears
  date: row['Transaction Date'],
  expense_name: row['Description 1'],
  amount: parseFloat(row['CAD$']),
  bank: 'RBC',
});

const parseScotiaCSV: BankCSVParser = (row, userId) => ({
  cardholder: '',  // Assume the user's name is used if no cardholder appears
  date: row['Date'],
  expense_name: row['Description'],
  amount: parseFloat(row['Amount']),
  bank: 'Scotia',
});

// Map to associate bank types with their respective parsers
const bankParsers: { [key: string]: BankCSVParser } = {
  'Amex': parseAmexCSV,
  'RBC': parseRBCCSV,
  'Scotia': parseScotiaCSV,
};

// CSV Upload and Processing Logic with Bank-Specific Handling
export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  const filePath = req.file?.path;
  const bankType = req.body.bank as string;
  const creditCardId = req.body.credit_card_id as string;
  const userId = req.body.user_id as string;
  const billingPeriodStart = req.body.billing_period_start;
  const billingPeriodEnd = req.body.billing_period_end;
  const paymentDueDate = req.body.payment_due_date;

  // Log initial request details
  console.log('CSV Upload Request:', { filePath, bankType, creditCardId, userId, billingPeriodStart, billingPeriodEnd, paymentDueDate });

  if (!filePath || !bankType || !creditCardId || !userId || !billingPeriodStart || !billingPeriodEnd || !paymentDueDate) {
    console.error('Invalid input:', { filePath, bankType, creditCardId, userId, billingPeriodStart, billingPeriodEnd, paymentDueDate });
    res.status(400).json({ message: 'Invalid input. Please provide valid values for CSV file, bank type, credit card ID, user ID, billing period start, billing period end, and payment due date.' });
    return;
  }

  const expenses: CSVRow[] = [];
  let totalDue = 0;

  // Select the appropriate parser based on the bank type
  const parseCSVRow = bankParsers[bankType];
  console.log('what kind of csv parser', parseCSVRow)
  if (!parseCSVRow) {
    res.status(400).json({ message: `Unsupported bank type: ${bankType}` });
    return;
  }

  // Fetch the user's name to use as cardholder if necessary
  const userName = await getUserName(userId);
  if (!userName) {
    res.status(400).json({ message: 'User not found for the given user_id' });
    return;
  }

  // Start reading and parsing the CSV file
  console.log('Starting CSV Parsing...');
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      let parsedRow = parseCSVRow(row, userId);

      // Use user's name if cardholder is not available in the CSV
      if (!parsedRow.cardholder) {
        parsedRow.cardholder = userName;
      }

      if (parsedRow && !isNaN(parsedRow.amount)) {
        expenses.push(parsedRow);
        totalDue += parsedRow.amount;
      } else {
        console.warn('Invalid row skipped:', row);
      }
    })
    .on('end', async () => {
      console.log('CSV Parsing Complete, Total Expenses:', expenses.length);
      try {
        // Insert the credit card bill first
        const creditCardBillId = await insertCreditCardBill({
          credit_card_id: creditCardId,
          billing_period_start: billingPeriodStart,
          billing_period_end: billingPeriodEnd,
          total_due: totalDue,
          payment_due_date: paymentDueDate,
        });

        if (!creditCardBillId) {
          console.error('Failed to insert credit card bill.');
          res.status(500).json({ message: 'Failed to insert credit card bill' });
          return;
        }

        // Insert each expense
        for (const expense of expenses) {
          const cardholderId = await insertOrGetCardholder(expense.cardholder, creditCardId, userId);
          const insertedExpense = await insertExpense(
            cardholderId,
            expense.expense_name,
            expense.amount,
            expense.date,
            creditCardId,
            userId,
            creditCardBillId,
            expense.bank,  // New bank field
          );
          console.log('Expense inserted:', insertedExpense);
        }

        res.status(200).json({ message: 'CSV file uploaded and processed successfully.' });
      } catch (err) {
        console.error('Error during CSV processing:', err);
        res.status(500).json({ message: 'Error processing CSV file' });
      } finally {
        fs.unlinkSync(filePath);  // Remove the uploaded file after processing
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
};
