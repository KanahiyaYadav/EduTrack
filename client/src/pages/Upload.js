import React, { useState } from 'react';
import Papa from 'papaparse';

const Upload = () => {
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState('');

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
      complete: function (results) {
        setCsvData(results.data);
        setError('');
      },
      error: function (err) {
        setError('Error parsing CSV file.');
      }
    });
  };

  return (
    <div>
      <h2>📁 Upload CSV Page</h2>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
        </div>
      )}
    </div>
  );
};

export default Upload;
