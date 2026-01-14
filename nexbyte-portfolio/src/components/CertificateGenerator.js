import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';

const CertificateGenerator = ({ intern, internship, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NEX-${timestamp}-${random}`.toUpperCase();
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const certificateId = generateCertificateId();
      const certificateInfo = {
        certificateId,
        internName: intern.name,
        internshipTitle: internship.internshipTitle,
        startDate: internship.startDate,
        endDate: internship.endDate || new Date().toISOString(),
        issuedDate: new Date().toISOString(),
        company: 'NexByte Core'
      };

      // Generate QR code data
      const qrData = JSON.stringify({
        certificateId,
        internName: intern.name,
        internshipTitle: internship.internshipTitle,
        verificationUrl: `https://nexbyte-dev.vercel.app/verify/${certificateId}`
      });

      setCertificateData({
        ...certificateInfo,
        qrData
      });

      // Call the backend to save certificate
      await onGenerate(certificateInfo);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      toast.error('Failed to generate certificate');
      console.error('Certificate generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateData) return;

    const element = document.getElementById('certificate-content');
    if (!element) return;

    // Create a canvas from the certificate element
    html2canvas(element).then(canvas => {
      const link = document.createElement('a');
      link.download = `certificate-${certificateData.certificateId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  if (!certificateData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Certificate</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Internship Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Intern:</span> {intern.name}</p>
              <p><span className="font-medium">Position:</span> {internship.internshipTitle}</p>
              <p><span className="font-medium">Duration:</span> {new Date(internship.startDate).toLocaleDateString()} - {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Present'}</p>
            </div>
          </div>
          <button
            onClick={handleGenerateCertificate}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Certificate'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Certificate Preview</h3>
          <button
            onClick={downloadCertificate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Download Certificate
          </button>
        </div>

        {/* Certificate Design - Matching your provided image */}
        <div id="certificate-content" className="relative bg-white border-8 border-double border-yellow-600 rounded-lg overflow-hidden">
          {/* Decorative Border Pattern */}
          <div className="absolute inset-0 border-4 border-solid border-yellow-500 rounded-lg pointer-events-none"></div>
          
          {/* Certificate Content */}
          <div className="relative p-12 text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">NEX</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">NEXBYTE - CORE</h1>
              <div className="w-32 h-1 bg-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-semibold">INTERNSHIP COMPLETION CERTIFICATE</p>
            </div>

            {/* Certificate Body */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-6">This is to certify that</p>
              <h2 className="text-3xl font-bold text-blue-600 mb-6">{certificateData.internName}</h2>
              <p className="text-lg text-gray-700 mb-4">has successfully completed the internship program as</p>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{certificateData.internshipTitle}</h3>
              
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{new Date(certificateData.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">{new Date(certificateData.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <p className="text-gray-600 italic">demonstrating exceptional skills and dedication throughout the internship period.</p>
            </div>

            {/* Certificate ID and Date */}
            <div className="mb-8">
              <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600">Certificate ID</p>
                <p className="font-mono font-bold text-gray-900">{certificateData.certificateId}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">Issued on {new Date(certificateData.issuedDate).toLocaleDateString()}</p>
            </div>

            {/* QR Code and Verification */}
            <div className="flex justify-center items-end space-x-12">
              <div className="text-center">
                <div className="border-2 border-gray-300 p-2 rounded bg-white">
                  <QRCode
                    value={certificateData.qrData}
                    size={100}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">Scan to verify</p>
              </div>
              
              {/* Signatures */}
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">Director</p>
                </div>
              </div>
            </div>

            {/* Verified Stamp */}
            <div className="absolute top-4 right-4 transform rotate-12">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center border-4 border-red-700">
                <div className="text-center">
                  <p className="text-white font-bold text-xs">VERIFIED</p>
                  <p className="text-white text-xs">NEXBYTE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={downloadCertificate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Print Certificate
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://nexbyte-dev.vercel.app/verify/${certificateData.certificateId}`);
              toast.success('Verification link copied!');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Copy Verification Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
