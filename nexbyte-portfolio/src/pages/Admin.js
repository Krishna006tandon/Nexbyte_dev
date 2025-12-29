import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectTaskManagement from '../components/ProjectTaskManagement';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    projectType: '',
    projectDescription: '',
    totalBudget: '',
    projectDeadline: '',
    clientType: 'non-client',
    associatedClient: ''
  });

  const [internForm, setInternForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'intern',
    internType: 'free'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [projectsRes, internsRes, tasksRes] = await Promise.all([
        fetch('/api/projects', { headers }),
        fetch('/api/interns', { headers }),
        fetch('/api/tasks', { headers })
      ]);

      if (!projectsRes.ok || !internsRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [projectsData, internsData, tasksData] = await Promise.all([
        projectsRes.json(),
        internsRes.json(),
        tasksRes.json()
      ]);

      setProjects(projectsData);
      setInterns(internsData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          ...projectForm,
          totalBudget: parseFloat(projectForm.totalBudget),
          projectDeadline: new Date(projectForm.projectDeadline)
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setShowProjectModal(false);
      setProjectForm({
        projectName: '',
        projectType: '',
        projectDescription: '',
        totalBudget: '',
        projectDeadline: '',
        clientType: 'non-client',
        associatedClient: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInternSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(internForm)
      });

      if (!response.ok) throw new Error('Failed to create intern');

      const newIntern = await response.json();
      setInterns([...interns, newIntern.user]);
      setShowInternModal(false);
      setInternForm({
        name: '',
        email: '',
        password: '',
        role: 'intern',
        internType: 'free'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIntern = async (internId) => {
    if (!window.confirm('Are you sure you want to delete this intern?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/interns/${internId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!response.ok) throw new Error('Failed to delete intern');

      setInterns(interns.filter(i => i._id !== internId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="dashboard-grid">
      <div className="stat-card">
        <h3>Total Projects</h3>
        <div className="stat-number">{projects.length}</div>
      </div>
      <div className="stat-card">
        <h3>Total Interns</h3>
        <div className="stat-number">{interns.length}</div>
      </div>
      <div className="stat-card">
        <h3>Total Tasks</h3>
        <div className="stat-number">{tasks.length}</div>
      </div>
      <div className="stat-card">
        <h3>Completed Tasks</h3>
        <div className="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="projects-section">
      <div className="section-header">
        <h2>Projects</h2>
        <button className="btn-primary" onClick={() => setShowProjectModal(true)}>
          Add New Project
        </button>
      </div>
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.projectName}</h3>
            <p><strong>Type:</strong> {project.projectType}</p>
            <p><strong>Budget:</strong> ₹{project.totalBudget}</p>
            <p><strong>Deadline:</strong> {new Date(project.projectDeadline).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={`status ${project.status}`}>{project.status}</span></p>
            <div className="card-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate(`/admin/projects/${project._id}/tasks`)}
              >
                Manage Tasks
              </button>
              <button className="btn-danger" onClick={() => handleDeleteProject(project._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterns = () => (
    <div className="interns-section">
      <div className="section-header">
        <h2>Interns</h2>
        <button className="btn-primary" onClick={() => setShowInternModal(true)}>
          Add New Intern
        </button>
      </div>
      <div className="interns-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Intern Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.map(intern => (
              <tr key={intern._id}>
                <td>{intern.name}</td>
                <td>{intern.email}</td>
                <td>{intern.role}</td>
                <td>{intern.internType || 'N/A'}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDeleteIntern(intern._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Handle project task management route
  if (params.projectId && params['*'] === 'tasks') {
    const project = projects.find(p => p._id === params.projectId);
    if (project) {
      return (
        <div className="admin-dashboard">
          <header className="admin-header">
            <h1>Task Management - {project.projectName}</h1>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </header>
          <ProjectTaskManagement 
            projectId={params.projectId}
            projectName={project.projectName}
            onBack={() => navigate('/admin')}
          />
        </div>
      );
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeSection === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeSection === 'projects' ? 'active' : ''}
          onClick={() => setActiveSection('projects')}
        >
          Projects
        </button>
        <button 
          className={activeSection === 'interns' ? 'active' : ''}
          onClick={() => setActiveSection('interns')}
        >
          Interns
        </button>
      </nav>

      <main className="admin-content">
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'projects' && renderProjects()}
        {activeSection === 'interns' && renderInterns()}
      </main>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleProjectSubmit}>
              <input
                type="text"
                placeholder="Project Name"
                value={projectForm.projectName}
                onChange={(e) => setProjectForm({...projectForm, projectName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Project Type"
                value={projectForm.projectType}
                onChange={(e) => setProjectForm({...projectForm, projectType: e.target.value})}
                required
              />
              <textarea
                placeholder="Project Description"
                value={projectForm.projectDescription}
                onChange={(e) => setProjectForm({...projectForm, projectDescription: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Total Budget"
                value={projectForm.totalBudget}
                onChange={(e) => setProjectForm({...projectForm, totalBudget: e.target.value})}
                required
              />
              <input
                type="date"
                value={projectForm.projectDeadline}
                onChange={(e) => setProjectForm({...projectForm, projectDeadline: e.target.value})}
                required
              />
              <select
                value={projectForm.clientType}
                onChange={(e) => setProjectForm({...projectForm, clientType: e.target.value})}
              >
                <option value="client">Client</option>
                <option value="non-client">Non-Client</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Project</button>
                <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intern Modal */}
      {showInternModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Intern</h2>
            <form onSubmit={handleInternSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={internForm.name}
                onChange={(e) => setInternForm({...internForm, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={internForm.email}
                onChange={(e) => setInternForm({...internForm, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={internForm.password}
                onChange={(e) => setInternForm({...internForm, password: e.target.value})}
                required
              />
              <select
                value={internForm.internType}
                onChange={(e) => setInternForm({...internForm, internType: e.target.value})}
              >
                <option value="free">Free Intern</option>
                <option value="stipend">Stipend Intern</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Intern</button>
                <button type="button" className="btn-secondary" onClick={() => setShowInternModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;