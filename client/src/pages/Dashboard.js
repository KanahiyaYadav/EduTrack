import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8080/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to fetch student data');
      }
    };

    fetchData();
  }, []);

  // Prepare data
  const names = students.map((s) => s.Name);
  const math = students.map((s) => s.Math);
  const science = students.map((s) => s.Science);
  const english = students.map((s) => s.English);
  const attendance = students.map((s) => s.Attendance);

  const average = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0);

  const barChartData = {
    labels: names,
    datasets: [
      {
        label: 'Math',
        data: math,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Science',
        data: science,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'English',
        data: english,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Attendance (%)',
        data: attendance,
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      }
    ]
  };

  const pieChartData = {
    labels: ['Math', 'Science', 'English', 'Attendance'],
    datasets: [
      {
        label: 'Average Scores',
        data: [
          average(math),
          average(science),
          average(english),
          average(attendance)
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div>
      <h2>📊 Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {students.length > 0 ? (
        <>
          <h3>Student Records</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Name</th>
                <th>Math</th>
                <th>Science</th>
                <th>English</th>
                <th>Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.ID}>
                  <td>{s.Name}</td>
                  <td>{s.Math}</td>
                  <td>{s.Science}</td>
                  <td>{s.English}</td>
                  <td>{s.Attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '40px' }}>
            <h3>Performance Overview (Bar Chart)</h3>
            <div style={{ height: '400px' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>

            <h3 style={{ marginTop: '40px' }}>Average Score Distribution (Pie Chart)</h3>
            <div style={{ height: '300px' }}>
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        </>
      ) : (
        <p>No student data available.</p>
      )}
    </div>
  );
};

export default Dashboard;
