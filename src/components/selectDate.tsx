import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

type SelectDateProps = {
  startDate: string;
  endDate: string;
  onChange: (key: 'startDate' | 'endDate', value: string) => void;
};

const SelectDate: React.FC<SelectDateProps> = ({ startDate, endDate, onChange }) => {
  // Helper to parse string date to Date object
  const parseDate = (dateString: string) => {
    return dateString ? new Date(dateString) : null;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Inline Start Date Picker */}
      <div className="flex flex-col items-center">
        <label className="font-bold text-gray-700 mb-2">Start Date:</label>
        <DatePicker
          selected={parseDate(startDate)}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = format(date, 'yyyy-MM-dd');
              onChange('startDate', formattedDate);
            }
          }}
          dateFormat="yyyy-MM-dd"
          inline
        />
      </div>

      {/* Inline End Date Picker */}
      <div className="flex flex-col items-center">
        <label className="font-bold text-gray-700 mb-2">End Date:</label>
        <DatePicker
          selected={parseDate(endDate)}
          onChange={(date: Date | null) => {
            if (date) {
              const formattedDate = format(date, 'yyyy-MM-dd');
              onChange('endDate', formattedDate);
            }
          }}
          dateFormat="yyyy-MM-dd"
          inline
        />
      </div>
    </div>
  );
};

export default SelectDate;
