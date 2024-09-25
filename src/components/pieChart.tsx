import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import 'tailwindcss/tailwind.css';

// Register the necessary components for the pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the props for the reusable PieChart component
type PieChartProps = {
  labels: string[];
  data: number[];
};

const PieChart: React.FC<PieChartProps> = ({ labels, data }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Total Amount Spent',
        data: data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data;
            return data.labels.map((label: string, i: number) => {
              const value = data.datasets[0].data[i];
              return {
                text: `${label}: $${value}`,
                fillStyle: data.datasets[0].backgroundColor[i],
              };
            });
          },
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || '';
            return `${label}: $${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
