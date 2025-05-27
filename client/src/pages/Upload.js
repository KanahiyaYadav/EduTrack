import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const Upload = () => {
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Only CSV files are allowed.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setError('');
        setSuccess('');
      },
      error: () => {
        setError('Error parsing CSV file.');
      }
    });
  };

  const handleSendToBackend = async () => {
    try {
      const response = await axios.post('http://localhost:8080/upload', csvData);
      setSuccess(`✅ Server responded: ${response.data.message}`);
    } catch (err) {
      setError(`❌ Failed to send data: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>📁 Upload CSV Page</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {csvData.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Preview of Uploaded Data:</h3>
          <table border="1" cellPadding="5">
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
          <button onClick={handleSendToBackend} style={{ marginTop: '15px' }}>
            Send Data to Backend
          </button>
        </div>
      )}
    </div>
  );
};

export default Upload;
