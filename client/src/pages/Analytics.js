import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Analytics.module.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8080/analytics');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to fetch analytics data');
      }
    };

    fetchAnalytics();
  }, []);

  const getCategoryClass = (category) => {
    if (category.includes('Top')) return styles.categoryTop;
    if (category.includes('Risk')) return styles.categoryRisk;
    if (category.includes('Needs')) return styles.categoryNeeds;
    return styles.categoryAverage;
  };

  return (
    <div className={styles.analyticsContainer}>
      <h1 className={styles.header}>
        <span>📈</span> Performance Analytics
      </h1>

      {error && (
        <div className={styles.error}>
          <span>❌</span> {error}
        </div>
      )}

      {!analytics && !error ? (
        <div className={styles.loading}>
          <span className={styles.loadingSpinner}></span>
          Loading analytics...
        </div>
      ) : analytics ? (
        <>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span>📊</span>
                <h2 className={styles.cardTitle}>Average Scores</h2>
              </div>
              <div className={styles.scoreGrid}>
                <div className={styles.scoreItem}>
                  <div className={styles.scoreLabel}>Math</div>
                  <div className={styles.scoreValue}>
                    {analytics.average_scores?.Math}%
                  </div>
                </div>
                <div className={styles.scoreItem}>
                  <div className={styles.scoreLabel}>Science</div>
                  <div className={styles.scoreValue}>
                    {analytics.average_scores?.Science}%
                  </div>
                </div>
                <div className={styles.scoreItem}>
                  <div className={styles.scoreLabel}>English</div>
                  <div className={styles.scoreValue}>
                    {analytics.average_scores?.English}%
                  </div>
                </div>
                <div className={styles.scoreItem}>
                  <div className={styles.scoreLabel}>Attendance</div>
                  <div className={styles.scoreValue}>
                    {analytics.average_scores?.Attendance}%
                  </div>
                </div>
              </div>

              <div className={styles.topPerformer}>
                <div className={styles.topPerformerLabel}>🏅 Top Performer</div>
                <div className={styles.topPerformerName}>
                  {analytics.top_student}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span>🎯</span>
                <h2 className={styles.cardTitle}>Performance Categories</h2>
              </div>
              <ul className={styles.studentList}>
                {analytics.categorized_students?.map((student, index) => (
                  <li key={index} className={styles.studentItem}>
                    <span className={styles.studentName}>{student.Name}</span>
                    <span className={`${styles.categoryBadge} ${getCategoryClass(student.Category)}`}>
                      {student.Category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Analytics;
