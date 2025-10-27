import React from 'react';
import './ProjectTracker.css';

const milestones = ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Completed'];

const ProjectTracker = ({ currentMilestone }) => {
  const currentMilestoneIndex = milestones.indexOf(currentMilestone);

  return (
    <div className="project-tracker-container">
      <div className="project-tracker">
        {milestones.map((milestone, index) => {
          let status = 'pending';
          if (index < currentMilestoneIndex) {
            status = 'completed';
          } else if (index === currentMilestoneIndex) {
            status = 'current';
          }

          return (
            <div key={milestone} className={`milestone ${status}`}>
              <div className="milestone-icon">
                {status === 'completed' ? '✓' : '●'}
              </div>
              <div className="milestone-name">{milestone}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTracker;
