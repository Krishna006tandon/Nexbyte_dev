import React from 'react';
import './CertificatePreview.css';

const CertificatePreview = ({ 
  internName, 
  internshipTitle, 
  startDate, 
  endDate, 
  certificateId,
  isSample = false 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="certificate-wrapper">
      <div className="certificate-container">
        <div className="certificate-content">
          {/* Background Pattern */}
          <div className="certificate-bg-pattern"></div>
          
          {/* Main Content */}
          <div className="certificate-main">
            {/* Title */}
            <div className="certificate-title-section">
              <h1 className="certificate-title">INTERNSHIP</h1>
              <h2 className="certificate-subtitle">COMPLETION</h2>
              <h3 className="certificate-award">CERTIFICATE</h3>
            </div>

            {/* Award Text */}
            <div className="certificate-award-text">
              <p className="certificate-given-to">THE FOLLOWING AWARD IS GIVEN TO</p>
              <h4 className="certificate-recipient-name">{internName || 'INTERN NAME'}</h4>
            </div>

            {/* Description */}
            <div className="certificate-description">
              <p>
                FOR SUCCESSFULLY COMPLETING THE INTERNSHIP PROGRAM AT NEXBYTE_CORE
              </p>
              <p className="certificate-achievement-text">
                FOR DEMONSTRATING EXCEPTIONAL DEDICATION, TECHNICAL SKILLS, AND 
                CONTRIBUTING SIGNIFICANTLY TO OUR PROJECTS AND TEAM SUCCESS.
              </p>
            </div>

            {/* Dates */}
            <div className="certificate-dates">
              <p className="certificate-date-text">
                FROM {formatDate(startDate)} TO {formatDate(endDate)}
              </p>
            </div>

            {/* Signatures */}
            <div className="certificate-signatures">
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">MANAGER</p>
                <p className="signature-company">NEXBYTE_CORE</p>
              </div>
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">MENTOR</p>
                <p className="signature-company">NEXBYTE_CORE</p>
              </div>
            </div>
          </div>

          {/* Right Side Elements */}
          <div className="certificate-right-side">
            {/* Ribbon/Seal */}
            <div className="certificate-ribbon">
              <div className="ribbon-content">
                <div className="ribbon-text">AWARD</div>
                <div className="ribbon-text">OF</div>
                <div className="ribbon-text">EXCELLENCE</div>
              </div>
            </div>

            {/* Verified Seal */}
            <div className="certificate-seal">
              <div className="seal-inner">
                <div className="seal-icon">✓</div>
                <div className="seal-text">VERIFIED</div>
              </div>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="certificate-id-bottom">
            <p>Certificate ID: {certificateId || 'NBINT-XXXX-XXXX'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;