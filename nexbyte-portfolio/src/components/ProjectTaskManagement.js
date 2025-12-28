import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskGenerator from './TaskGenerator';
import TaskList from './TaskList';
import './ProjectTaskManagement.css';

const ProjectTaskManagement = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const response = await fetch(`/api/projects/${projectId}`, { headers });
            if (!response.ok) {
                throw new Error('Failed to fetch project details');
            }
            const data = await response.json();
            setProject(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTasksSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleBackToProjects = () => {
        navigate('/admin/task-management');
    };

    if (loading) {
        return (
            <div className="project-task-management">
                <div className="loading-container">
                    <h4>Loading project details...</h4>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="project-task-management">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={handleBackToProjects} className="back-btn">
                        ← Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="project-task-management">
                <div className="error-container">
                    <p>Project not found</p>
                    <button onClick={handleBackToProjects} className="back-btn">
                        ← Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="project-task-management">
            <div className="project-header">
                <div className="header-top">
                    <button onClick={handleBackToProjects} className="back-btn">
                        ← Back to Projects
                    </button>
                    <h2>{project.projectName}</h2>
                </div>
                
                <div className="project-info">
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Type:</strong> {project.projectType}
                        </div>
                        <div className="info-item">
                            <strong>Status:</strong> 
                            <span className={`status-badge ${project.status || 'Active'}`}>
                                {project.status || 'Active'}
                            </span>
                        </div>
                        <div className="info-item">
                            <strong>Budget:</strong> ₹{project.totalBudget ? project.totalBudget.toLocaleString() : 'N/A'}
                        </div>
                        <div className="info-item">
                            <strong>Deadline:</strong> {project.projectDeadline ? new Date(project.projectDeadline).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="info-item">
                            <strong>Client Type:</strong> {project.clientType || 'non-client'}
                        </div>
                        {project.clientType === 'client' && project.associatedClient && (
                            <div className="info-item">
                                <strong>Client:</strong> {project.associatedClient.clientName || 'N/A'}
                            </div>
                        )}
                    </div>
                    
                    {project.projectDescription && (
                        <div className="project-description">
                            <strong>Description:</strong>
                            <p>{project.projectDescription}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="task-management-content">
                <div className="task-generator-section">
                    <h3>Generate Tasks for {project.projectName}</h3>
                    <TaskGenerator 
                        project={project}
                        onTasksSaved={handleTasksSaved}
                    />
                </div>

                <div className="task-list-section">
                    <TaskList 
                        projectId={projectId} 
                        refreshTrigger={refreshTrigger}
                        projectName={project.projectName}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectTaskManagement;
