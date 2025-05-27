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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('http://localhost:8080/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to fetch student data.');
      }
    };

    fetchStudents();
  }, []);

  const names = students.map((s) => s.Name);
  const math = students.map((s) => s.Math);
  const science = students.map((s) => s.Science);
  const english = students.map((s) => s.English);

  const average = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const barChartData = {
    labels: names,
    datasets: [
      {
        label: 'Math',
        data: math,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      },
      {
        label: 'Science',
        data: science,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      },
      {
        label: 'English',
        data: english,
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Subject-wise Scores'
      }
    }
  };

  const pieChartData = {
    labels: ['Math Avg', 'Science Avg', 'English Avg'],
    datasets: [
      {
        data: [average(math), average(science), average(english)],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Average Scores by Subject'
      }
    }
  };

  return (
    <div>
      <h2>📊 Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {students.length > 0 ? (
        <>
          <h3>Student Data Table</h3>
          <table border="1" cellPadding="5" style={{ margin: '20px auto', width: '80%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Math</th>
                <th>Science</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.ID}>
                  <td>{s.Name}</td>
                  <td>{s.Math}</td>
                  <td>{s.Science}</td>
                  <td>{s.English}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <div style={{ width: '600px', height: '400px', margin: '20px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>

            <div style={{ width: '400px', height: '400px', margin: '20px' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        </>
      ) : (
        <p>No student data available. Please upload some CSV data.</p>
      )}
    </div>
  );
};

export default Dashboard;
