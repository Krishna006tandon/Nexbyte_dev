import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const VerifyPortal = () => {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      // Optional: Call POST /api/verify if you want to verify here before redirecting.
      // Or simply redirect to the direct URL which handles verification automatically:
      navigate(`/certificate/${certId.trim().toUpperCase()}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Helmet>
        <title>Verify Certificate | NexByte Core</title>
        <meta name="description" content="Verify the authenticity of NexByte Core certificates." />
      </Helmet>

      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        {/* Logo Placeholder */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#1E3A8A', fontSize: '32px', margin: 0, fontWeight: 'bold' }}>NexByte Core</h1>
          <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '16px' }}>Certificate Verification Portal</p>
        </div>

        <form onSubmit={handleVerify} style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="certId" style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '500' }}>
              Enter Certificate ID
            </label>
            <input
              id="certId"
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. NBC-INT-26001"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#DC2626', fontSize: '14px', marginBottom: '16px', textAlign: 'left' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !certId.trim()}
            style={{
              width: '100%',
              backgroundColor: loading || !certId.trim() ? '#94a3b8' : '#2563EB',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !certId.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
          By verifying, you agree to our Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default VerifyPortal;
