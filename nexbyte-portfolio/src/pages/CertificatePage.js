import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificatePreview from '../components/CertificatePreview';
import './CertificatePage.css';

const CertificatePage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/certificates/${certificateId}`, {
          headers: {
            'x-auth-token': token || '',
          },
        });

        if (res.status === 401 || res.status === 403) {
          setError('You are not authorized to view this certificate.');
          return;
        }

        if (!res.ok) {
          setError('Certificate not found or an error occurred.');
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownload = () => {
    if (!window.html2pdf || !certificateRef.current) {
      alert('Download is not available in this environment.');
      return;
    }
    window.html2pdf().from(certificateRef.current).save(`certificate_${certificateId}.pdf`);
  };

  if (loading) {
    return (
      <div className="nb-cert-page nb-cert-page-center">
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nb-cert-page nb-cert-page-center">
        <p className="nb-cert-error">{error}</p>
        <button className="nb-cert-back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const payload = data?.data || {};

  return (
    <div className="nb-cert-page">
      <div className="nb-cert-page-actions">
        <button className="nb-cert-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="nb-cert-download-btn" onClick={handleDownload}>
          Download PDF
        </button>
      </div>

      <div ref={certificateRef}>
        <CertificatePreview
          internName={payload.internName}
          internshipTitle={payload.internshipTitle}
          startDate={payload.startDate}
          endDate={payload.endDate}
          certificateId={payload.certificateId}
          isSample={false}
        />
      </div>
    </div>
  );
};

export default CertificatePage;

