import React, { useContext } from 'react';
import { SrsContext } from '../context/SrsContext';
import './SrsGenerator.css';

const SrsGenerator = () => {
  const { srsData } = useContext(SrsContext);

  const handlePrint = () => {
    window.print();
  };

  if (!srsData) {
    return (
      <div className="srs-generator-container">
        <h1>SRS Generator</h1>
        <p>Please go to the <a href="/admin/srs-generator">Admin Panel</a> to generate an SRS document.</p>
      </div>
    );
  }

  return (
    <div className="srs-generator-container">
      <h1>Software Requirements Specification (SRS)</h1>
      <div className="srs-output">
        <section>
          <h2>1. Introduction</h2>
          <p><strong>Project Name:</strong> {srsData.projectName}</p>
          <p><strong>Project Description:</strong> {srsData.projectDescription}</p>
          <p><strong>Target Audience:</strong> {srsData.targetAudience}</p>
        </section>
        <section>
          <h2>2. Functional Requirements</h2>
          <pre>{srsData.functionalRequirements}</pre>
        </section>
        <section>
          <h2>3. Non-Functional Requirements</h2>
          <pre>{srsData.nonFunctionalRequirements}</pre>
        </section>
        <button onClick={handlePrint} className="btn btn-primary">Print SRS</button>
      </div>
    </div>
  );
};

export default SrsGenerator;