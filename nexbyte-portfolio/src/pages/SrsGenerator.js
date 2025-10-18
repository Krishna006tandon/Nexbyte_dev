import React, { useContext } from 'react';
import { SrsContext } from '../context/SrsContext';
import './SrsGenerator.css';

const SrsGenerator = () => {
  const { srsFullData } = useContext(SrsContext);

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

  const { client, projectName, projectDescription, targetAudience, functionalRequirements, nonFunctionalRequirements } = srsFullData;

  return (
    <div className="srs-generator-container">
      <div className="srs-header">
        <h1>Software Requirements Specification</h1>
        <h2>{projectName}</h2>
      </div>
      <div className="srs-output">
        <div className="srs-section">
          <h3>1. Introduction</h3>
          <p><strong>Project Description:</strong> {projectDescription}</p>
        </div>

        {client && (
          <div className="srs-section">
            <h3>2. Client Information</h3>
            <p><strong>Client Name:</strong> {client.clientName}</p>
            <p><strong>Contact Person:</strong> {client.contactPerson}</p>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
            <p><strong>Company Address:</strong> {client.companyAddress}</p>
          </div>
        )}

        <div className="srs-section">
          <h3>3. User and System Requirements</h3>
          <p><strong>Target Audience:</strong> {targetAudience}</p>
          <h4>3.1 Functional Requirements</h4>
          <pre>{functionalRequirements}</pre>
          <h4>3.2 Non-Functional Requirements</h4>
          <pre>{nonFunctionalRequirements}</pre>
        </div>

        {client && (
          <div className="srs-section">
            <h3>4. Project Details</h3>
            <p><strong>Project Type:</strong> {client.projectType}</p>
            <p><strong>Project Deadline:</strong> {new Date(client.projectDeadline).toLocaleDateString()}</p>
            <p><strong>Total Budget:</strong> ${client.totalBudget}</p>
          </div>
        )}

        <div className="text-center mt-4">
            <button onClick={handlePrint} className="btn btn-primary">Print SRS</button>
        </div>
      </div>
    </div>
  );
};

export default SrsGenerator;