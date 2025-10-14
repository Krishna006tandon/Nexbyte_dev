import React from 'react';
import './Projects.css';

const Projects = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Our Projects</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="card project-card mb-4">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Project One" />
            <div className="card-body">
              <h5 className="card-title">Project One</h5>
              <p className="card-text">A brief description of the first project.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card project-card mb-4">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Project Two" />
            <div className="card-body">
              <h5 className="card-title">Project Two</h5>
              <p className="card-text">A brief. description of the second project.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card project-card mb-4">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Project Three" />
            <div className="card-body">
              <h5 className="card-title">Project Three</h5>
              <p className="card-text">A brief description of the third project.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;