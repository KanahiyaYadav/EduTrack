import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8080/analytics');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to fetch analytics');
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div>
      <h2>📈 Analytics Page</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {analytics ? (
        <div style={{ textAlign: 'left', margin: '20px auto', width: '60%' }}>
          <h3>📊 Average Scores</h3>
          <ul>
            <li><strong>Math:</strong> {analytics.average_scores?.Math}</li>
            <li><strong>Science:</strong> {analytics.average_scores?.Science}</li>
            <li><strong>English:</strong> {analytics.average_scores?.English}</li>
            <li><strong>Attendance:</strong> {analytics.average_scores?.Attendance}%</li>
          </ul>

          <h3>🏅 Top Performer</h3>
          <p>{analytics.top_student}</p>

          <h3>🎯 Student Performance Categories</h3>
          <ul>
            {analytics.categorized_students?.map((s, i) => (
              <li key={i}>
                <strong>{s.Name}:</strong>{' '}
                <span style={{
                  color:
                    s.Category.includes("Top") ? "green" :
                    s.Category.includes("Risk") ? "red" :
                    s.Category.includes("Needs") ? "orange" : "gray"
                }}>
                  {s.Category}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  );
};

export default Analytics;
