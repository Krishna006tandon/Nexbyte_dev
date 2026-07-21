import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CertificateResultCard = ({ certificate }) => {
  if (!certificate) return null;

  const {
    studentName,
    programName,
    awardName,
    certificateId,
    issueDate,
    internshipDuration,
    status,
    qrCodeUrl
  } = certificate;

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'Valid':
        return <span style={{ backgroundColor: '#16A34A', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Valid</span>;
      case 'Revoked':
        return <span style={{ backgroundColor: '#DC2626', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Revoked</span>;
      case 'Expired':
        return <span style={{ backgroundColor: '#64748b', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1E3A8A',
        color: '#ffffff',
        padding: '24px',
        textAlign: 'center',
        borderBottom: '4px solid #2563EB'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>✅ Certificate Verified</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>NexByte Core Official Record</p>
      </div>

      {/* Body */}
      <div style={{ padding: '32px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{studentName}</p>
          </div>

          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Program</p>
            <p style={{ margin: 0, fontSize: '16px', color: '#334155' }}>{programName}</p>
          </div>

          {awardName && (
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Award</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#334155', fontWeight: '500' }}>🏆 {awardName}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Certificate ID</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E3A8A' }}>{certificateId}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Issue Date</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#334155' }}>{formatDate(issueDate)}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Duration</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#334155' }}>{internshipDuration}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>Status</p>
              <div style={{ marginTop: '4px' }}>{getStatusBadge()}</div>
            </div>
          </div>
          
        </div>

        {/* QR Code Section */}
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          backgroundColor: '#F8FAFC', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px dashed #cbd5e1'
        }}>
          <QRCodeSVG 
            value={qrCodeUrl || `https://nexbytecore.com/certificate/${certificateId}`} 
            size={120} 
            level="M" 
            includeMargin={false}
          />
          <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
            Scan to verify authenticity
          </p>
        </div>

      </div>
    </div>
  );
};

export default CertificateResultCard;
