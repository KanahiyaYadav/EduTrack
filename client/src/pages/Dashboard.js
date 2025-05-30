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
import styles from './Dashboard.module.css';

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

  const averages = {
    math: average(math),
    science: average(science),
    english: average(english),
    attendance: average(attendance)
  };

  const getScoreClass = (score) => {
    if (score >= 80) return styles.scoreHigh;
    if (score >= 60) return styles.scoreMedium;
    return styles.scoreLow;
  };

  const barChartData = {
    labels: names,
    datasets: [
      {
        label: 'Math',
        data: math,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Science',
        data: science,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'English',
        data: english,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
      {
        label: 'Attendance (%)',
        data: attendance,
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
      }
    ]
  };

  const pieChartData = {
    labels: ['Math', 'Science', 'English', 'Attendance'],
    datasets: [
      {
        label: 'Average Scores',
        data: [averages.math, averages.science, averages.english, averages.attendance],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(255, 206, 86)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.header}>
        <span>📊</span> Academic Performance Dashboard
      </h1>
      
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {students.length > 0 ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Average Math Score</h3>
              <p>{averages.math}%</p>
            </div>
            <div className={styles.statCard}>
              <h3>Average Science Score</h3>
              <p>{averages.science}%</p>
            </div>
            <div className={styles.statCard}>
              <h3>Average English Score</h3>
              <p>{averages.english}%</p>
            </div>
            <div className={styles.statCard}>
              <h3>Average Attendance Rate</h3>
              <p>{averages.attendance}%</p>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Student Performance Details</h2>
            </div>
            <div className={styles.scrollContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Math</th>
                    <th>Science</th>
                    <th>English</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.ID}>
                      <td>{s.Name}</td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={`${styles.scoreIndicator} ${getScoreClass(s.Math)}`}></span>
                          {s.Math}%
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={`${styles.scoreIndicator} ${getScoreClass(s.Science)}`}></span>
                          {s.Science}%
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={`${styles.scoreIndicator} ${getScoreClass(s.English)}`}></span>
                          {s.English}%
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={`${styles.scoreIndicator} ${getScoreClass(s.Attendance)}`}></span>
                          {s.Attendance}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.chartsContainer}>
            <div className={styles.chartWrapper}>
              <h3 className={styles.chartTitle}>Individual Performance Comparison</h3>
              <div style={{ height: '400px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>

            <div className={styles.chartWrapper}>
              <h3 className={styles.chartTitle}>Class Average Distribution</h3>
              <div style={{ height: '400px' }}>
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.statCard}>
          <p>No student data available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
