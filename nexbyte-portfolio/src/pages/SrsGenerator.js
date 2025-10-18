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

  const { projectOverview, introduction, overallDescription, specificRequirements, externalInterfaceRequirements, systemModels } = srsFullData;

  return (
    <div className="srs-generator-container">
      <div className="srs-output">
        <div className="srs-section">
            <h1 className="text-center">Software Requirements Specification</h1>
            <h2 className="text-center">{projectOverview.title}</h2>
            <p><strong>Version:</strong> {projectOverview.version}</p>
            <p><strong>Date:</strong> {projectOverview.date}</p>
            <p><strong>Author:</strong> {projectOverview.author}</p>
            <p><strong>Purpose:</strong> {projectOverview.purpose}</p>
        </div>

        <div className="srs-section">
          <h3>1. Introduction</h3>
          <p><strong>Purpose:</strong> {introduction.purpose}</p>
          <h4>Scope:</h4>
          <ul>
            {introduction.scope.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h4>Definitions & Acronyms:</h4>
          <ul>
            {introduction.definitions.map((def, index) => (
                <li key={index}><strong>{def.acronym}:</strong> {def.definition}</li>
            ))}
            </ul>
            <h4>References:</h4>
            <ul>
                {introduction.references.map((ref, index) => (
                    <li key={index}>{ref}</li>
                ))}
            </ul>
        </div>

        <div className="srs-section">
            <h3>2. Overall Description</h3>
            <p><strong>Product Perspective:</strong> {overallDescription.productPerspective}</p>
            <h4>Product Functions:</h4>
            <ul>
                {overallDescription.productFunctions.map((func, index) => (
                    <li key={index}>{func}</li>
                ))}
            </ul>
            <h4>User Classes:</h4>
            <ul>
                {overallDescription.userClasses.map((userClass, index) => (
                    <li key={index}><strong>{userClass.class}:</strong> {userClass.description}</li>
                ))}
            </ul>
            <p><strong>Operating Environment:</strong> {overallDescription.operatingEnvironment}</p>
            <h4>Design Constraints:</h4>
            <ul>
                {overallDescription.designConstraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                ))}
            </ul>
            <h4>Assumptions & Dependencies:</h4>
            <ul>
                {overallDescription.assumptionsAndDependencies.map((ad, index) => (
                    <li key={index}>{ad}</li>
                ))}
            </ul>
        </div>

        <div className="srs-section">
            <h3>3. Specific Requirements</h3>
            <h4>3.1 Functional Requirements</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Inputs</th>
                        <th>Outputs</th>
                        <th>Priority</th>
                        <th>Acceptance Criteria</th>
                    </tr>
                </thead>
                <tbody>
                    {specificRequirements.functionalRequirements.map((req, index) => (
                        <tr key={index}>
                            <td>{req.id}</td>
                            <td>{req.title}</td>
                            <td>{req.description}</td>
                            <td>{req.inputs}</td>
                            <td>{req.outputs}</td>
                            <td>{req.priority}</td>
                            <td>{req.acceptanceCriteria}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h4>3.2 Non-Functional Requirements</h4>
            <p><strong>Performance:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.performance}</pre>
            <p><strong>Security:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.security}</pre>
            <p><strong>Usability:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.usability}</pre>
            <p><strong>Reliability:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.reliability}</pre>
            <p><strong>Maintainability:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.maintainability}</pre>
            <p><strong>Scalability:</strong></p>
            <pre>{specificRequirements.nonFunctionalRequirements.scalability}</pre>
        </div>

        <div className="srs-section">
            <h3>4. External Interface Requirements</h3>
            <p><strong>User Interfaces:</strong></p>
            <pre>{externalInterfaceRequirements.userInterfaces}</pre>
            <p><strong>Hardware Interfaces:</strong></p>
            <pre>{externalInterfaceRequirements.hardwareInterfaces}</pre>
            <p><strong>Software Interfaces:</strong></p>
            <p><pre>{externalInterfaceRequirements.softwareInterfaces}</pre></p>
            <p><strong>Communication Interfaces:</strong></p>
            <pre>{externalInterfaceRequirements.communicationInterfaces}</pre>
        </div>

        <div className="srs-section">
            <h3>5. System Models</h3>
            <p><strong>Use Cases:</strong></p>
            <pre>{systemModels.useCases}</pre>
            <p><strong>ER Diagram (Entities & Relations):</strong></p>
            <pre>{systemModels.erDiagram}</pre>
        </div>


        <div className="text-center mt-4">
            <button onClick={handlePrint} className="btn btn-primary">Print SRS</button>
        </div>
      </div>
    </div>
  );
};

export default SrsGenerator;