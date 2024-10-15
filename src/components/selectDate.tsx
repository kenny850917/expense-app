import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

type SelectDateProps = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onChange: (key: 'startDate' | 'endDate', value: string) => void;
};

const SelectDate: React.FC<SelectDateProps> = ({ startDate, endDate, onChange }) => {
  // Handler for date range changes
  const handleDateChange = (dates: [Date | null, Date | null] | null) => {
    if (dates) {
      const [start, end] = dates;

      if (start) {
        const formattedStart = format(start, 'yyyy-MM-dd');
        onChange('startDate', formattedStart);
      } else {
        onChange('startDate', '');
      }

      if (end) {
        const formattedEnd = format(end, 'yyyy-MM-dd');
        onChange('endDate', formattedEnd);
      } else {
        onChange('endDate', '');
      }
    } else {
      // If dates is null, reset both dates
      onChange('startDate', '');
      onChange('endDate', '');
    }
  };

  return (
    <div className="p-10 flex items-center justify-center">
      {/* Inline Date Range Picker */}
      <div className="flex flex-col items-center ">
        <p className="font-bold text-gray-700 mb-2">Select Date Range:</p>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          dateFormat="yyyy-MM-dd"
        />
      </div>
    </div>
  );
};

export default SelectDate;
