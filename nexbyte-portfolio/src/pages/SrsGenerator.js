import React, { useContext, useEffect, useState } from 'react';
import { SrsContext } from '../context/SrsContext';
import './SrsGenerator.css';

const SrsGenerator = () => {
  const { srsFullData } = useContext(SrsContext);
  const [generatedSrs, setGeneratedSrs] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (srsFullData) {
      const generateSrs = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/generate-srs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
            body: JSON.stringify(srsFullData),
          });

          if (!response.ok) {
            throw new Error('Failed to generate SRS');
          }

          const data = await response.json();
          setGeneratedSrs(data.srsContent);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      generateSrs();
    }
  }, [srsFullData]);

  const handlePrint = () => {
    window.print();
  };

  if (!srsFullData) {
    return (
      <div className="srs-generator-container">
        <div className="card text-center">
          <div className="card-body">
            <h1 className="card-title">SRS Generator</h1>
            <p className="card-text">Please go to the <a href="/admin/srs-generator">Admin Panel</a> to generate an SRS document.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="srs-generator-container">
            <div className="card text-center">
                <div className="card-body">
                    <h1 className="card-title">Generating SRS...</h1>
                    <p className="card-text">Please wait while we generate the detailed SRS document for you.</p>
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="srs-generator-container">
            <div className="card text-center">
                <div className="card-body">
                    <h1 className="card-title">Error</h1>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="srs-generator-container">
      <div className="srs-output">
        <pre>{generatedSrs}</pre>
        <div className="text-center mt-4">
            <button onClick={handlePrint} className="btn btn-primary">Print SRS</button>
        </div>
      </div>
    </div>
  );
};

export default SrsGenerator;