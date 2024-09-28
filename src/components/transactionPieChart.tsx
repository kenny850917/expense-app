import React from 'react';
import PieChart from './pieChart';

type Transaction = {
  expense_name: string;
  credit_card_bill_id: string;
  amount: number;
  expense_date: string;
  cardholder_name: string;
  bank: string;
};

type TransactionPieChartProps = {
  filteredTransactions: Transaction[];
};

const TransactionPieChart: React.FC<TransactionPieChartProps> = ({ filteredTransactions }) => {
  // Summing up the amount for each cardholder for the pie chart
  const pieChartData = filteredTransactions.reduce<Record<string, number>>((acc, transaction) => {
    const { cardholder_name, amount } = transaction;
    const parsedAmount = parseFloat(String(amount)); // Ensure it's parsed as a number

    if (!acc[cardholder_name]) {
      acc[cardholder_name] = 0;
    }
    acc[cardholder_name] += isNaN(parsedAmount) ? 0 : parsedAmount;

    return acc;
  }, {});

  const pieChartLabels = Object.keys(pieChartData);
  const pieChartAmounts = Object.values(pieChartData).map(amount => 
    parseFloat(amount.toFixed(2)) // Convert to string with 2 decimals and then parse back to number
  );

  return (
    <div>
      {pieChartLabels.length > 0 ? (
        <PieChart labels={pieChartLabels} data={pieChartAmounts} />
      ) : (
        <p>No data available for the selected date range.</p>
      )}
    </div>
  );
};

export default TransactionPieChart;
