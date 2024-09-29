import React, { useState, useEffect } from 'react';
import TransactionPieChart from './transactionPieChart';
import SelectDate from './selectDate';
import { parse } from 'date-fns';

type Transaction = {
  expense_name: string;
  credit_card_bill_id: string;
  amount: number;
  expense_date: string;
  cardholder_name: string;
  bank: string;
};

type DashboardState = {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  startDate: string;
  endDate: string;
  sortConfig: { key: keyof Transaction; direction: 'asc' | 'desc' } | null;
  selectedCardholder: string | null;
  selectedBank: string | null;
  expenseNameSearch: string | null;
  billNameSearch: string | null;
};

const CardholderDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [state, setState] = useState<DashboardState>({
    transactions: [],
    filteredTransactions: [],
    startDate: '',
    endDate: '',
    sortConfig: null,
    selectedCardholder: null,
    selectedBank: null,
    expenseNameSearch: null,
    billNameSearch: null,
  });

  const baseUrl = process.env.BASE_API_URL || 'http://localhost:5000';

  // Handle change in state
  const handleChange = <K extends keyof DashboardState>(key: K, value: DashboardState[K]) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    setState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };


  // Fetch transaction details based on the date range
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/transactions/${userId}?startDate=${state.startDate}&endDate=${state.endDate}`
      );
      const data = await response.json();
      handleChange('transactions', data);
      handleChange('filteredTransactions', data); // Set initial filtered transactions
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  //parseDate to string function

  const parseDate = (dateString: string): Date | undefined => {
    return dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : undefined;
  };


  // Filter transactions based on user interactions (cardholder, bank, etc.)
  useEffect(() => {
    let updatedTransactions = state.transactions.length>0 ? [...state.transactions]:[];

    if (state.selectedCardholder) {
      updatedTransactions = updatedTransactions.filter((t) => t.cardholder_name === state.selectedCardholder);
    }

    if (state.selectedBank) {
      updatedTransactions = updatedTransactions.filter((t) => t.bank === state.selectedBank);
    }

    if (state.expenseNameSearch) {
      updatedTransactions = updatedTransactions.filter((t) =>
        t.expense_name.toLowerCase().includes(state.expenseNameSearch!.toLowerCase())
      );
    }
    if (state.billNameSearch) {
      updatedTransactions = updatedTransactions.filter((t) =>
        t.credit_card_bill_id.toLowerCase().includes(state.billNameSearch!.toLowerCase())
      );
    }

    if (state.sortConfig !== null) {
      updatedTransactions.sort((a, b) => {
        const key = state.sortConfig!.key;
        if (a[key] < b[key]) {
          return state.sortConfig!.direction === 'asc' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return state.sortConfig!.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    handleChange('filteredTransactions', updatedTransactions);
  }, [
    state.selectedCardholder,
    state.selectedBank,
    state.expenseNameSearch,
    state.billNameSearch,
    state.sortConfig,
    state.transactions,
  ]);

  // Handle sorting when clicking on table headers
  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (state.sortConfig && state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    handleChange('sortConfig', { key, direction });
  };

  // Fetch transactions on date change
  useEffect(() => {
    if (state.startDate && state.endDate) {
      fetchTransactions();
    }
  }, [state.startDate, state.endDate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Cardholder Dashboard</h1>
      <div className="p-6 flex items-stretch">
      <SelectDate
        startDate={parseDate(state.startDate)}
        endDate={parseDate(state.endDate)}
        onChange={handleDateChange}
/>
        <div className="flex items-center">
      <TransactionPieChart filteredTransactions={state.filteredTransactions.length>0?state.filteredTransactions:[]} />
        </div>
      </div>

      {/* Table of Transactions with Sorting and Filters */}
      <div className="w-full mt-8">
        <h2 className="text-xl font-bold mb-4">Detailed Transactions</h2>
        <table className="min-w-full table-auto bg-white shadow-md rounded-md">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('cardholder_name')}>
                Cardholder
              </th>
              <th className="px-4 py-2 cursor-pointer">
                Bill Id
                <select
                  className="border ml-2"
                  onChange={(e) => handleChange('billNameSearch', e.target.value)}
                  value={state.billNameSearch || ''}
                >
                  <option value="">All</option>
                  {state.transactions.length >0&& Array.from(new Set(state.transactions.map((t) => t.credit_card_bill_id))).map((id, index) => (
                    <option key={index} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-2">
                Expense Name
                <select
                  className="border ml-2"
                  onChange={(e) => handleChange('expenseNameSearch', e.target.value)}
                  value={state.expenseNameSearch || ''}
                >
                  <option value="">All</option>
                  {state.transactions.length >0 ? Array.from(new Set(state.transactions.map((t) => t.expense_name))).map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  )):''}
                </select>
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('amount')}>
                Amount
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('expense_date')}>
                Date
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('bank')}>
                Bank
              </th>
              </tr>
          </thead>
          <tbody>
            {state.filteredTransactions.length ? state.filteredTransactions.map((transaction, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{transaction.cardholder_name}</td>
                <td className="px-4 py-2">{transaction.credit_card_bill_id}</td>
                <td className="px-4 py-2">{transaction.expense_name}</td>
                <td className="px-4 py-2">${parseFloat(String(transaction.amount)).toFixed(2)}</td>
                <td className="px-4 py-2">{transaction.expense_date}</td>
                <td className="px-4 py-2">{transaction.bank}</td>
              </tr>
            )):''}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardholderDashboard;
