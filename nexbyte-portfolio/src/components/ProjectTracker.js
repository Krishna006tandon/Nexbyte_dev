import React from 'react';
import './ProjectTracker.css';

const milestones = ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Completed'];

const getMilestoneIcon = (milestone, status) => {
  if (status === 'completed') {
    return '✅';
  }
  switch (milestone) {
    case 'Planning':
      return '🗓️';
    case 'Design':
      return '🎨';
    case 'Development':
      return '💻';
    case 'Testing':
      return '🔬';
    case 'Deployment':
      return '🚀';
    case 'Completed':
      return '🏁';
    default:
      return '●';
  }
};

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
                {getMilestoneIcon(milestone, status)}
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