import React, { useState } from 'react';
import './SrsGenerator.css';

const SrsGenerator = () => {
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [srsContent, setSrsContent] = useState('');

  const handleGenerate = () => {
    // AI generation will be simulated here.
    const generatedSrs = `
# Software Requirements Specification (SRS) for ${clientName}

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements for the project: ${projectDescription}.

### 1.2 Project Scope
The project aims to address the following business goal: ${projectGoal}.

### 1.3 Target Industry
${clientIndustry}

## 2. Functional Requirements
- User Authentication
- Feature A
- Feature B

## 3. Non-Functional Requirements
- Performance
- Security
- Usability
    `;
    setSrsContent(generatedSrs);
  };

  return (
    <div className="srs-generator-container">
      <h1>AI-Powered SRS Generator</h1>
      <div className="srs-form">
        <input type="text" placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        <input type="text" placeholder="Client Industry (e.g., Healthcare, E-commerce)" value={clientIndustry} onChange={(e) => setClientIndustry(e.target.value)} />
        <textarea placeholder="Primary Business Goal" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)} />
        <textarea placeholder="Project Description" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
        <button onClick={handleGenerate}>Generate with AI</button>
      </div>
      {srsContent && (
        <div className="srs-output">
          <h2>Generated SRS</h2>
          <pre>{srsContent}</pre>
        </div>
      )}
    </div>
  );
};

export default SrsGenerator;
