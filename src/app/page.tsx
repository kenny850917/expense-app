'use client'
import React from 'react';
import UploadCSV from '../components/uploadCSV';
import CardholderDashboard from '../components/cardholderDashboard';
const userId = 'fbff1481-4148-48c6-929d-c52122ea4682';

const Page: React.FC = () => {
  const uploadUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/expenses/upload-csv';  // Default to localhost

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <CardholderDashboard userId={userId}/>
        <h1 className="text-center text-2xl font-bold mb-6">CSV Upload</h1>
        <UploadCSV uploadUrl={uploadUrl} />
      </div>
    </div>
  );
};

export default Page;
