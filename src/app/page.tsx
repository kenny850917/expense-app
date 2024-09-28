'use client'
import React from 'react';
import UploadCSV from '../components/uploadCSV';
import CardholderDashboard from '../components/cardholderDashboard';
const userId = 'fbff1481-4148-48c6-929d-c52122ea4682';

const Page: React.FC = () => {
  const baseUrl = process.env.BASE_API_URL || 'http://localhost:5000';  // Default to localhost
  // console.log('what is baseurl',`${baseUrl}/expenses/upload-csv`)
return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="w-full max-w-md">
      <CardholderDashboard userId={userId} />
      <h1 className="text-center text-2xl font-bold mb-6">CSV Upload</h1>
      <UploadCSV 
        uploadUrl={`${baseUrl}/expenses/upload-csv`}   // Use curly braces for string interpolation
        usersUrl={`${baseUrl}/users`}                 // Use curly braces for string interpolation
        creditCardsUrl={`${baseUrl}/credit_cards`}    // Use curly braces for string interpolation
        banksUrl={`${baseUrl}/banks`}                 // Use curly braces for string interpolation
      />
    </div>
  </div>
);
}


export default Page;
