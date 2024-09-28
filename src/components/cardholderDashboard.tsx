import React, { useState, useEffect } from 'react';
import PieChart from './pieChart';

type CardholderData = {
  cardholder_name: string;
  total_amount_spent: number;
};

type Transaction = {
  expense_name: string;
  credit_card_bill_id: string;
  amount: number;
  expense_date: string;
  cardholder_name: string;
  bank: string;
};

const CardholderDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [cardholderData, setCardholderData] = useState<CardholderData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const baseUrl = process.env.BASE_API_URL || 'http://localhost:5000';
  console.log('process env',process.env.BASE_API_URL)
  // Fetch cardholder data based on the date range
  const fetchCardholderData = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/cardholder-amounts/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setCardholderData(data);
    } catch (error) {
      console.error('Error fetching cardholder data:', error);
    }
  };

  // Fetch transaction details based on the date range
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/transactions/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchCardholderData();
      fetchTransactions();
    }
  }, [startDate, endDate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Cardholder Dashboard</h1>

      <div className="mb-4">
        <label className="mr-2">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1"
        />
        <label className="ml-4 mr-2">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      {/* Display PieChart for Cardholder Amounts */}
      {cardholderData.length > 0 ? (
        <PieChart
          labels={cardholderData.map((item) => item.cardholder_name)}
          data={cardholderData.map((item) => item.total_amount_spent)}
        />
      ) : (
        <p>No data available for the selected date range.</p>
      )}

      {/* Table of Transactions */}
      {transactions.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-bold mb-4">Detailed Transactions</h2>
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">Cardholder</th>
                <th className="px-4 py-2">Bill Id</th>
                <th className="px-4 py-2">Expense Name</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Bank</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{transaction.cardholder_name}</td>
                  <td className="px-4 py-2">{transaction.credit_card_bill_id}</td>
                  <td className="px-4 py-2">{transaction.expense_name}</td>
                  <td className="px-4 py-2">${transaction.amount}</td>
                  <td className="px-4 py-2">{transaction.expense_date}</td>
                  <td className="px-4 py-2">{transaction.bank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CardholderDashboard;

