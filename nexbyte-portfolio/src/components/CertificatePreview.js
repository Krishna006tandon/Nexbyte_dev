import React from 'react';
import './CertificatePreview.css';

const CertificatePreview = ({
  internName,
  internshipTitle,
  startDate,
  endDate,
  certificateId,
  isSample = false,
}) => {
  const formattedStart = startDate ? new Date(startDate).toLocaleDateString() : 'Start Date';
  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString() : 'End Date';

  return (
    <div className="nb-certificate-wrapper">
      {isSample && (
        <div className="nb-certificate-watermark-text">
          SAMPLE CERTIFICATE
        </div>
      )}

      <div className="nb-certificate-container" id="nb-certificate">
        <div className="nb-certificate-border">
          <div className="nb-certificate-inner">
            <header className="nb-certificate-header">
              <div className="nb-certificate-logo-title">
                <div className="nb-certificate-logo-circle">
                  <img
                    src="/NexByte_Core%20Logo%20.png"
                    alt="Nexbyte Core Logo"
                    className="nb-certificate-logo-img"
                  />
                </div>
                <div className="nb-certificate-header-text">
                  <h1 className="nb-certificate-main-title">INTERNSHIP</h1>
                  <h2 className="nb-certificate-sub-title">COMPLETION CERTIFICATE</h2>
                </div>
              </div>
            </header>

            <section className="nb-certificate-body">
              <p className="nb-certificate-award-text">
                THE FOLLOWING AWARD IS GIVEN TO
              </p>

              <h3 className="nb-certificate-name">
                {internName || 'Intern Name'}
              </h3>

              <p className="nb-certificate-description">
                This certificate is hereby presented to{' '}
                <span className="nb-certificate-highlight">
                  {internName || 'the intern'}
                </span>{' '}
                for the successful completion of the{' '}
                <span className="nb-certificate-highlight">
                  {internshipTitle || 'Internship Program'}
                </span>{' '}
                at Nexbyte_Core, held from {formattedStart} to {formattedEnd}.<br />
                The intern has demonstrated professionalism, dedication, and strong competency in all assigned responsibilities.
              </p>

              <div className="nb-certificate-meta-row">
                <div className="nb-certificate-meta-block">
                  <span className="nb-certificate-meta-label">Certificate ID</span>
                  <span className="nb-certificate-meta-value">
                    {certificateId || 'NBINT-XXXX-XXXX'}
                  </span>
                </div>
                <div className="nb-certificate-meta-block">
                  <span className="nb-certificate-meta-label">Issued By</span>
                  <span className="nb-certificate-meta-value">Nexbyte_Core</span>
                </div>
              </div>

              <div className="nb-certificate-signature-row">
                <div className="nb-certificate-signature-block">
                  <div className="nb-certificate-line" />
                  <p className="nb-certificate-sign-label">Manager</p>
                  <p className="nb-certificate-sign-name">Nexbyte_Core</p>
                </div>
                <div className="nb-certificate-seal">
                  <div className="nb-certificate-seal-inner">
                    <span className="nb-certificate-seal-text">VERIFIED</span>
                  </div>
                  <span className="nb-certificate-seal-ring">
                    Nexbyte_Core • Learning • Building • Growing
                  </span>
                </div>
                <div className="nb-certificate-signature-block">
                  <div className="nb-certificate-line" />
                  <p className="nb-certificate-sign-label">Mentor</p>
                  <p className="nb-certificate-sign-name">Nexbyte_Core</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;

