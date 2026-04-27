// src/App.jsx
// Root component — manages app state and page routing
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ResultsPage from './pages/ResultsPage';
import { runFullAudit } from './services/api';

const VIEW = { UPLOAD: 'upload', LOADING: 'loading', RESULTS: 'results', ERROR: 'error' };

export default function App() {
  const [view,     setView]     = useState(VIEW.UPLOAD);
  const [results,  setResults]  = useState(null);
  const [fileName, setFileName] = useState('');
  const [domain,   setDomain]   = useState('loan');
  const [error,    setError]    = useState('');

  const handleAuditStart = async (file, selectedDomain) => {
    setFileName(file.name);
    setDomain(selectedDomain);
    setView(VIEW.LOADING);
    setError('');

    try {
      const data = await runFullAudit(file, selectedDomain);
      setResults(data);
      setView(VIEW.RESULTS);
    } catch (err) {
      console.error('Audit failed:', err);
      const msg = err.response?.data?.detail || err.message || 'Audit failed. Please try again.';
      setError(msg);
      setView(VIEW.ERROR);
    }
  };

  const handleReset = () => {
    setView(VIEW.UPLOAD);
    setResults(null);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grey-50)' }}>
      <Navbar />

      {view === VIEW.UPLOAD && (
        <UploadPage onAuditStart={handleAuditStart} />
      )}

      {view === VIEW.LOADING && (
        <LoadingPage fileName={fileName} />
      )}

      {view === VIEW.RESULTS && results && (
        <ResultsPage
          results={results}
          fileName={fileName}
          domain={domain}
          onReset={handleReset}
        />
      )}

      {view === VIEW.ERROR && (
        <div style={{
          maxWidth: 520, margin: '80px auto', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--grey-900)' }}>
            Audit Failed
          </h2>
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius)',
            background: 'var(--red-lt)', color: 'var(--red)',
            fontSize: 13, marginBottom: 20, lineHeight: 1.5,
          }}>
            {error}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-500)', marginBottom: 20, lineHeight: 1.6 }}>
            Common fixes:
            <br/>• Make sure your CSV has the columns: gender, state_type, income_bracket, caste_category, approved
            <br/>• Check that the backend is running at <code style={{ fontFamily: 'var(--font-mono)' }}>REACT_APP_API_URL</code>
            <br/>• Dataset must have at least 30 rows
          </div>
          <button onClick={handleReset} style={{
            padding: '8px 24px', borderRadius: 20, border: '1px solid var(--grey-300)',
            background: 'var(--blue)', color: 'white',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
