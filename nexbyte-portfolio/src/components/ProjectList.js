import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectList.css';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            const response = await fetch('/api/projects', { headers });
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectClick = (projectId) => {
        navigate(`/admin/task-management/${projectId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return '#28a745';
            case 'Completed':
                return '#007bff';
            case 'On Hold':
                return '#ffc107';
            case 'Cancelled':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <div className="project-list-container"><h4>Loading projects...</h4></div>;
    }

    if (error) {
        return <div className="project-list-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="project-list-container">
            <div className="project-list-header">
                <h2>Project List</h2>
                <p>Click on a project to view and manage its tasks</p>
            </div>
            
            {projects.length === 0 ? (
                <div className="no-projects">
                    <p>No projects found. Create a project first to manage tasks.</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div 
                            key={project._id} 
                            className="project-card"
                            onClick={() => handleProjectClick(project._id)}
                        >
                            <div className="project-header">
                                <h3>{project.projectName}</h3>
                                <span 
                                    className="project-status"
                                    style={{ backgroundColor: getStatusColor(project.status || 'Active') }}
                                >
                                    {project.status || 'Active'}
                                </span>
                            </div>
                            
                            <div className="project-details">
                                <div className="project-info">
                                    <strong>Type:</strong> {project.projectType}
                                </div>
                                <div className="project-info">
                                    <strong>Budget:</strong> ₹{project.totalBudget || 'N/A'}
                                </div>
                                <div className="project-info">
                                    <strong>Deadline:</strong> {formatDate(project.projectDeadline)}
                                </div>
                                <div className="project-info">
                                    <strong>Client Type:</strong> {project.clientType || 'non-client'}
                                </div>
                                {project.associatedClient && (
                                    <div className="project-info">
                                        <strong>Client:</strong> {project.associatedClient.clientName || 'N/A'}
                                    </div>
                                )}
                            </div>
                            
                            {project.projectDescription && (
                                <div className="project-description">
                                    <p>{project.projectDescription.substring(0, 150)}...</p>
                                </div>
                            )}
                            
                            <div className="project-footer">
                                <button className="view-tasks-btn">
                                    Manage Tasks →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectList;
