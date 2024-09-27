import React, { useState, useEffect } from 'react';
import InputField from './inputField';
import Dropdown from './dropdown';

type UploadCSVProps = {
  uploadUrl: string;
  usersUrl: string;
  creditCardsUrl: string;
  banksUrl: string;
};

const UploadCSV: React.FC<UploadCSVProps> = ({ uploadUrl, usersUrl, creditCardsUrl, banksUrl }) => {
  const [formData, setFormData] = useState({
    selectedFile: null as File | null,
    userId: '',
    creditCardId: '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    paymentDueDate: '',
    bankType: '',
  });
  const [users, setUsers] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(usersUrl);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [usersUrl]);

  // Fetch credit cards for the selected user
  useEffect(() => {
    if (!formData.userId) {
      setCreditCards([]); // Clear credit cards when no user is selected
      return;
    }
    const fetchCreditCards = async () => {
      try {
        const response = await fetch(`${creditCardsUrl}?userId=${formData.userId}`);
        const data = await response.json();
        setCreditCards(data);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
      }
    };
    fetchCreditCards();
  }, [formData.userId, creditCardsUrl]);

  // Fetch bank types
  useEffect(() => {
    if (!formData.userId) {
      setBanks([]); // Clear banks when no user is selected
      return;
    }
    const fetchBanks = async () => {
      try {
        const response = await fetch(`${banksUrl}?userId=${formData.userId}`);
        const data = await response.json();
        setBanks(data);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };
    fetchBanks();
  }, [formData.userId, banksUrl]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Check if the target is an HTMLInputElement and if it has files (for file upload)
    if (e.target instanceof HTMLInputElement && e.target.files) {
      setFormData({ ...formData, [name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { selectedFile, creditCardId, userId, billingPeriodStart, billingPeriodEnd, paymentDueDate, bankType } = formData;

    if (!selectedFile || !creditCardId || !userId || !billingPeriodStart || !billingPeriodEnd || !paymentDueDate || !bankType) {
      setUploadStatus('All fields are required.');
      return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append('file', selectedFile);
    formDataToUpload.append('credit_card_id', creditCardId);
    formDataToUpload.append('user_id', userId);
    formDataToUpload.append('billing_period_start', billingPeriodStart);
    formDataToUpload.append('billing_period_end', billingPeriodEnd);
    formDataToUpload.append('payment_due_date', paymentDueDate);
    formDataToUpload.append('bank', bankType);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataToUpload,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully.');
        // Clear the form after successful upload
        setFormData({
          selectedFile: null,
          userId: '',
          creditCardId: '',
          billingPeriodStart: '',
          billingPeriodEnd: '',
          paymentDueDate: '',
          bankType: '',
        });
      } else {
        setUploadStatus('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file.');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <form onSubmit={handleSubmit}>
        {/* User ID Dropdown */}
        <Dropdown
          label="Select User"
          name="userId"
          value={formData.userId}
          options={users.map((user) => ({ value: user.id, label: user.name }))}
          onChange={handleInputChange}
        />

        {/* Credit Card Dropdown */}
        <Dropdown
          label="Select Credit Card"
          name="creditCardId"
          value={formData.creditCardId}
          options={creditCards.map((card) => ({ value: card.id, label: card.card_name }))}
          onChange={handleInputChange}
          disabled={!formData.userId || creditCards.length === 0}
        />

        {/* Bank Type Dropdown */}
        <Dropdown
          label="Select Bank Type"
          name="bankType"
          value={formData.bankType}
          options={banks.map((bank) => ({ value: bank.account_name, label: bank.account_name }))}
          onChange={handleInputChange}
          disabled={!formData.userId || creditCards.length === 0}
        />

        {/* Billing Period Start */}
        <InputField
          label="Billing Period Start"
          type="date"
          name="billingPeriodStart"
          value={formData.billingPeriodStart}
          onChange={handleInputChange}
        />

        {/* Billing Period End */}
        <InputField
          label="Billing Period End"
          type="date"
          name="billingPeriodEnd"
          value={formData.billingPeriodEnd}
          onChange={handleInputChange}
        />

        {/* Payment Due Date */}
        <InputField
          label="Payment Due Date"
          type="date"
          name="paymentDueDate"
          value={formData.paymentDueDate}
          onChange={handleInputChange}
        />

        {/* File Upload */}
        <input
          type="file"
          name="selectedFile"
          accept=".csv"
          onChange={handleInputChange}
          required
          className="mb-4 w-full px-3 py-2 border rounded-md"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ${
            (!formData.selectedFile || !formData.creditCardId || !formData.userId || !formData.billingPeriodStart || !formData.billingPeriodEnd || !formData.paymentDueDate || !formData.bankType)
            ? 'opacity-50 cursor-not-allowed'
            : ''
          }`}
          disabled={!formData.selectedFile || !formData.creditCardId || !formData.userId || !formData.billingPeriodStart || !formData.billingPeriodEnd || !formData.paymentDueDate || !formData.bankType}
        >
          Upload
        </button>

        {/* Status Message */}
        {uploadStatus && <p className="mt-4 text-red-500">{uploadStatus}</p>}
      </form>
    </div>
  );
};

export default UploadCSV;

