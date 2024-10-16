// Import necessary modules
import { Request, Response } from 'express';
import fs from 'fs';
import csvParser from 'csv-parser';
import { parse, format } from 'date-fns';
import {
  insertOrGetCardholder,
  insertExpense,
  getUserName,
} from '../helpers/dbHelpers';
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
type BankCSVParser = (row: any, userId: string) => CSVRow | null;

// Bank-specific parsing logic (Amex, RBC, Scotia, etc.)
const parseAmexCSV: BankCSVParser = (row, userId) => {
  // Extract the date string from the CSV row
  const dateString = row['Date'];

  // Parse the date string using the exact format from the CSV
  let parsedDate;
  try {
    parsedDate = parse(dateString, 'd-MMM-yy', new Date());
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    return null; // Skip this row if date parsing fails
  }

  // Format the parsed date into 'yyyy-MM-dd' format for database insertion
  const formattedDate = format(parsedDate, 'yyyy-MM-dd');

  return {
    cardholder: row['Card Member'] || '',
    date: formattedDate,
    expense_name: row['Description'],
    amount: parseFloat(row['Amount']),
    bank: 'Amex',
  };
};

const parseRBCCSV: BankCSVParser = (row, userId) => {
  const dateString = row['Transaction Date'];

  let parsedDate;
  try {
    parsedDate = parse(dateString, 'MM/dd/yyyy', new Date());
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    return null;
  }

  const formattedDate = format(parsedDate, 'yyyy-MM-dd');

  return {
    cardholder: '', // Use user's name if cardholder is not available
    date: formattedDate,
    expense_name: row['Description 1'],
    amount: parseFloat(row['CAD$']),
    bank: 'RBC',
  };
};

const parseScotiaCSV: BankCSVParser = (row, userId) => {
  const dateString = row['Date'];
  // console.log('datestring?',dateString)

  let parsedDate;
  try {
    parsedDate = parse(dateString, 'yyyy/M/d', new Date());
    // console.log('parsedDate',parsedDate)
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    return null;
  }

  const formattedDate = format(parsedDate, 'yyyy-MM-dd');

  return {
    cardholder: '', // Use user's name if cardholder is not available
    date: formattedDate,
    expense_name: row['Description'],
    amount: parseFloat(row['Amount']),
    bank: 'Scotia',
  };
};

// Map to associate bank types with their respective parsers
const bankParsers: { [key: string]: BankCSVParser } = {
  Amex: parseAmexCSV,
  RBC: parseRBCCSV,
  Scotia: parseScotiaCSV,
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
  // console.log('CSV Upload Request:', {
  //   filePath,
  //   bankType,
  //   creditCardId,
  //   userId,
  //   billingPeriodStart,
  //   billingPeriodEnd,
  //   paymentDueDate,
  // });

  if (
    !filePath ||
    !bankType ||
    !creditCardId ||
    !userId ||
    !billingPeriodStart ||
    !billingPeriodEnd ||
    !paymentDueDate
  ) {
    console.error('Invalid input:', {
      filePath,
      bankType,
      creditCardId,
      userId,
      billingPeriodStart,
      billingPeriodEnd,
      paymentDueDate,
    });
    res.status(400).json({
      message:
        'Invalid input. Please provide valid values for CSV file, bank type, credit card ID, user ID, billing period start, billing period end, and payment due date.',
    });
    return;
  }

  const expenses: CSVRow[] = [];
  let totalDue = 0;

  // Select the appropriate parser based on the bank type
  const parseCSVRow = bankParsers[bankType];
  console.log('Using CSV parser for bank:', bankType);

  if (!parseCSVRow) {
    res.status(400).json({ message: `Unsupported bank type: ${bankType}` });
    return;
  }

  try {
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
        const parsedRow = parseCSVRow(row, userId);

        if (!parsedRow) {
          console.warn('Invalid row skipped due to parsing error:', row);
          return;
        }

        // Use user's name if cardholder is not available in the CSV
        if (!parsedRow.cardholder) {
          parsedRow.cardholder = userName;
        }

        if (!isNaN(parsedRow.amount)) {
          expenses.push(parsedRow);
          totalDue += parsedRow.amount;
        } else {
          console.warn('Invalid amount in row, skipped:', row);
        }
      })
      .on('end', async () => {
        console.log(
          'CSV Parsing Complete. Total Expenses:',
          expenses.length,
          'Total Due:',
          totalDue
        );
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
            res.status(500).json({
              message: 'Failed to insert credit card bill',
            });
            return;
          }

          // Insert each expense
          for (const expense of expenses) {
            const cardholderId = await insertOrGetCardholder(
              expense.cardholder,
              creditCardId,
              userId
            );
            const insertedExpense = await insertExpense(
              cardholderId,
              expense.expense_name,
              expense.amount,
              expense.date,
              creditCardId,
              userId,
              creditCardBillId,
              expense.bank // Bank field
            );
            console.log('Expense inserted:', insertedExpense);
          }

          res
            .status(200)
            .json({ message: 'CSV file uploaded and processed successfully.' });
        } catch (err) {
          console.error('Error during CSV processing:', err);
          res.status(500).json({ message: 'Error processing CSV file' });
        } finally {
          fs.unlinkSync(filePath); // Remove the uploaded file after processing
        }
      })
      .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(500).json({ message: 'Error reading CSV file' });
        fs.unlinkSync(filePath); // Ensure the file is removed in case of error
      });
  } catch (error) {
    console.error('Error during CSV upload:', error);
    res.status(500).json({ message: 'Error during CSV upload' });
    if (filePath) {
      fs.unlinkSync(filePath); // Remove the uploaded file in case of error
    }
  }
};
