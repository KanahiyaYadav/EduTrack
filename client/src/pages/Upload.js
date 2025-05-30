import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import styles from './Upload.module.css';

const Upload = () => {
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Only CSV files are allowed');
      setCsvData([]);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.');
          setCsvData([]);
          return;
        }
        setCsvData(results.data);
        setError('');
        setSuccess('File uploaded successfully! Preview the data below.');
      },
      error: () => {
        setError('Error parsing CSV file');
        setCsvData([]);
      }
    });
  };

  const handleSendToBackend = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8080/upload', csvData);
      setSuccess(`✅ ${response.data.message}`);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.header}>
        <span>📁</span> Data Upload
      </h1>

      <div className={styles.uploadSection}>
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.uploadIcon}>📄</div>
          <p className={styles.uploadText}>
            Drag and drop your CSV file here or click to browse
          </p>
          <p className={styles.uploadSubtext}>
            Supported format: CSV
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>

        {error && (
          <div className={styles.error}>
            <span>❌</span> {error}
          </div>
        )}
        
        {success && (
          <div className={styles.success}>
            <span>✅</span> {success}
          </div>
        )}
      </div>

      {csvData.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>
              <span>👀</span> Data Preview
            </h2>
          </div>
          
          <div className={styles.scrollContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {Object.keys(csvData[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <button
              className={styles.button}
              onClick={handleSendToBackend}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Upload to Database
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
