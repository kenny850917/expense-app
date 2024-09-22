// src/controllers/expenseController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { insertOrGetCardholder, insertExpense } from '../helpers/dbHelpers';
import { insertCreditCardBill } from './creditCardBillController';

// Define types for the CSV row, expense, and cardholder
type CSVRow = {
  cardholder: string;
  expense_name: string;
  amount: number;
  date: string;
};

type Expense = {
  cardholderId: string;  // Changed from number to string (UUID)
  expense_name: string;
  amount: number;
  date: string;
  creditCardId: string;  // Changed from number to string (UUID);
  userId: string;  // Changed from number to string (UUID)
  creditCardBillId:string;  // Changed from number to string (UUID)
};

// CSV Upload and Processing Logic
export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  const filePath = req.file?.path;
  const creditCardId = req.body.credit_card_id as string;
  const userId = req.body.user_id as string;
  const billingPeriodStart = req.body.billing_period_start; // Now part of the POST body
  const billingPeriodEnd = req.body.billing_period_end;     // Now part of the POST body
  const paymentDueDate = req.body.payment_due_date;         // Now part of the POST body

  // Log initial request details
  console.log('CSV Upload Request:', { filePath, creditCardId, userId, billingPeriodStart, billingPeriodEnd, paymentDueDate });

  if (!filePath || !creditCardId || !userId || !billingPeriodStart || !billingPeriodEnd || !paymentDueDate) {
    console.error('Invalid input:', { filePath, creditCardId, userId, billingPeriodStart, billingPeriodEnd, paymentDueDate });
    res.status(400).json({ message: 'Invalid input. Please provide valid values for CSV file, credit card ID, user ID, billing period start, billing period end, and payment due date.' });
    return;
  }

  const expenses: CSVRow[] = [];
  let totalDue = 0;

  // Start reading and parsing the CSV file
  console.log('Starting CSV Parsing...');
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // console.log('Processing row:', row);
      const cardholder = row['Card Member'];
      const expense_name = row['Description'];
      const amount = parseFloat(row['Amount']);
      const date = row['Date'];

      if (cardholder && expense_name && !isNaN(amount)) {
        expenses.push({ cardholder, expense_name, amount, date });
        totalDue += amount;
        // console.log('Valid row added:', { cardholder, expense_name, amount, date });
      } else {
        console.warn('Invalid row skipped:', row);
      }
    })
    .on('end', async () => {
      console.log('CSV Parsing Complete, Total Expenses:', expenses.length);
      try {
        // Insert the credit card bill first, using the POST body data
        const creditCardBillId = await insertCreditCardBill({
          credit_card_id: creditCardId,
          billing_period_start: billingPeriodStart,
          billing_period_end: billingPeriodEnd,
          total_due: totalDue,
          payment_due_date: paymentDueDate
        });

        if (!creditCardBillId) {
          console.error('Failed to insert credit card bill.');
          res.status(500).json({ message: 'Failed to insert credit card bill' });
          return;
        }

        // Insert each expense
        for (const expense of expenses) {
          const { cardholder, expense_name, amount, date } = expense;

          // Insert or get cardholder ID
          const cardholderId = await insertOrGetCardholder(cardholder, creditCardId, userId);
          console.log(`Cardholder ID for ${cardholder}:`, cardholderId);

          // Insert expense
          const expenseData: Expense = {
            cardholderId,
            expense_name,
            amount,
            date,
            creditCardId,
            userId,
            creditCardBillId
          };
          const insertedExpense = await insertExpense(
            expenseData.cardholderId,
            expenseData.expense_name,
            expenseData.amount,
            expenseData.date,
            expenseData.creditCardId,
            expenseData.userId,
            expenseData.creditCardBillId
          );
          console.log('Expense inserted:', insertedExpense);
        }

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath);
        console.log('Uploaded file removed:', filePath);

        res.status(200).json({ message: 'CSV file uploaded and processed successfully.' });
      } catch (err) {
        console.error('Error during CSV processing:', err);
        res.status(500).json({ message: 'Error processing CSV file' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
};
