import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ background: '#282c34', padding: '20px', color: 'white' }}>
          <h1>EduTrack</h1>
          <nav>
            <Link to="/" style={{ margin: '0 10px', color: 'white' }}>Dashboard</Link>
            <Link to="/upload" style={{ margin: '0 10px', color: 'white' }}>Upload CSV</Link>
            <Link to="/analytics" style={{ margin: '0 10px', color: 'white' }}>Analytics</Link>
          </nav>
        </header>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
