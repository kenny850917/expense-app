import React, { useState } from 'react';

type UploadCSVProps = {
  uploadUrl: string;
};

const UploadCSV: React.FC<UploadCSVProps> = ({ uploadUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creditCardId, setCreditCardId] = useState<string>('');  // State for credit_card_id
  const [userId, setUserId] = useState<string>('');  // State for user_id
  const [billingPeriodStart, setBillingPeriodStart] = useState<string>('');  // State for billing_period_start
  const [billingPeriodEnd, setBillingPeriodEnd] = useState<string>('');  // State for billing_period_end
  const [paymentDueDate, setPaymentDueDate] = useState<string>('');  // State for payment_due_date
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !creditCardId || !userId || !billingPeriodStart || !billingPeriodEnd || !paymentDueDate) {
      setUploadStatus('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('credit_card_id', creditCardId);  // Append credit_card_id
    formData.append('user_id', userId);  // Append user_id
    formData.append('billing_period_start', billingPeriodStart);  // Append billing_period_start
    formData.append('billing_period_end', billingPeriodEnd);  // Append billing_period_end
    formData.append('payment_due_date', paymentDueDate);  // Append payment_due_date

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully.');
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
        {/* Credit Card ID */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credit_card_id">
            Credit Card ID
          </label>
          <input
            type="text"
            id="credit_card_id"
            value={creditCardId}
            onChange={(e) => setCreditCardId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter Credit Card ID"
            required
          />
        </div>

        {/* User ID */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_id">
            User ID
          </label>
          <input
            type="text"
            id="user_id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter User ID"
            required
          />
        </div>

        {/* Billing Period Start */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="billing_period_start">
            Billing Period Start
          </label>
          <input
            type="date"
            id="billing_period_start"
            value={billingPeriodStart}
            onChange={(e) => setBillingPeriodStart(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Billing Period End */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="billing_period_end">
            Billing Period End
          </label>
          <input
            type="date"
            id="billing_period_end"
            value={billingPeriodEnd}
            onChange={(e) => setBillingPeriodEnd(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Payment Due Date */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_due_date">
            Payment Due Date
          </label>
          <input
            type="date"
            id="payment_due_date"
            value={paymentDueDate}
            onChange={(e) => setPaymentDueDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Upload CSV File
          </label>
          <input
            type="file"
            id="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
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
