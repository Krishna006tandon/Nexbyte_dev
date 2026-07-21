import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CertificateResultCard from '../components/CertificateResultCard';

const CertificatePage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        // Note: You should mount the backend route in your server (e.g. /api/certificate/:id)
        const res = await fetch(`/api/certificate/${certificateId}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setCertificate(data.certificate);
        } else {
          setError(data.message || 'Certificate not found.');
        }
      } catch (err) {
        setError('An error occurred while verifying the certificate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  return (
    <div style={{
      minHeight: '80vh',
      backgroundColor: '#F8FAFC',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Helmet>
        <title>Certificate Verification | {certificateId} | NexByte Core</title>
        <meta name="description" content={`Verify the authenticity of Certificate ${certificateId} issued by NexByte Core.`} />
      </Helmet>

      {/* Optionally place logo here */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1E3A8A', fontSize: '28px', margin: 0 }}>NexByte Core</h1>
        <p style={{ color: '#64748b', margin: '8px 0 0 0' }}>Official Verification Portal</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', color: '#2563EB', fontSize: '18px' }}>
          Verifying certificate...
        </div>
      ) : error || !certificate ? (
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ color: '#DC2626', margin: '0 0 16px 0', fontSize: '24px' }}>❌ Certificate Not Found</h2>
          <p style={{ color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            {error || 'This Certificate ID does not exist in our records.'}
          </p>
          <button 
            onClick={() => navigate('/verify')}
            style={{
              backgroundColor: '#1E3A8A',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1E3A8A'}
          >
            Search Again
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '700px' }}>
          <CertificateResultCard certificate={certificate} />
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
             <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Verification link copied to clipboard!');
              }}
              style={{
                backgroundColor: '#ffffff',
                color: '#2563EB',
                border: '1px solid #2563EB',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Copy Link
            </button>
            <button 
              onClick={() => window.print()}
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Print Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatePage;
