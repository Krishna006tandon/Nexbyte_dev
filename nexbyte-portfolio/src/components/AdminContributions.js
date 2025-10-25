import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import './AdminContributions.css';

const AdminContributions = () => {
  const data = {
    labels: ['Testing', 'Editing', 'Development', 'Design'],
    datasets: [
      {
        label: 'Work Contribution (in hours)',
        data: [10, 5, 20, 8],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const totalHours = data.datasets[0].data.reduce((acc, cur) => acc + cur, 0);

  return (
    <div className="admin-contributions-sidebar">
      <h3>Admin Contributions</h3>
      <div className="chart-container">
        <h4>Work Distribution (Percentage)</h4>
        <ul>
          {data.labels.map((label, index) => (
            <li key={index}>
              {label}: {((data.datasets[0].data[index] / totalHours) * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
      <div className="chart-container">
        <h4>Work Distribution (Bar Chart)</h4>
        <Bar data={data} />
      </div>
      <div className="chart-container">
        <h4>Work Distribution (Pie Chart)</h4>
        <Pie data={data} />
      </div>
    </div>
  );
};

export default AdminContributions;
