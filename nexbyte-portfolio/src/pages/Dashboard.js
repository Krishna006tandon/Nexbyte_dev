import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiUsers, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';
import Modal from '../components/Modal';

import DataTable from '../components/DataTable';
import axios from 'axios';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const totalBudget = 0;
  const spentBudget = 0;
  const remainingBudget = 0;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch projects (clients) and users on component mount
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const usersRes = await axios.get('/api/users', { headers: { 'x-auth-token': token } });
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const projectsRes = await axios.get('/api/clients', { headers: { 'x-auth-token': token } });
        setProjects(projectsRes.data);
        if (projectsRes.data.length > 0) {
          setSelectedProject(projectsRes.data[0]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
    fetchUsers();
  }, []);

  

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const project = projects.find(p => p._id === projectId);
    setSelectedProject(project);
  };

  



  

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <select className="project-selector" onChange={handleProjectChange} value={selectedProject?._id || ''}>
            <option value="" disabled>Select a Project</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.projectName}</option>
            ))}
          </select>
          <button className="add-project-btn" onClick={openModal}>
            <FiPlus />
            Add New Project
          </button>
        </div>
      </header>

      {selectedProject && (
        <div className="stats-grid">
          {/* Budget Stats */}
          <div className="stat-card">
            <FiDollarSign className="stat-icon" />
            <div className="stat-info">
              <h2>${totalBudget.toLocaleString()}</h2>
              <p>Total Budget</p>
            </div>
          </div>
          <div className="stat-card">
            <FiTrendingDown className="stat-icon" />
            <div className="stat-info">
              <h2 className="spent">${spentBudget.toLocaleString()}</h2>
              <p>Spent (from 70% available)</p>
            </div>
          </div>
          <div className="stat-card">
            <FiTrendingUp className="stat-icon" />
            <div className="stat-info">
              <h2 className="remaining">${remainingBudget.toLocaleString()}</h2>
              <p>Remaining</p>
            </div>
          </div>
          
<div className="stat-card">
            <FiUsers className="stat-icon" />
            <div className="stat-info">
              <h2>{users.length}</h2>
              <p>Team Users</p>
            </div>
          </div>
        </div>
      )}

      

      <div className="table-section">
        <h2>User Credits</h2>
        <DataTable 
          columns={['Email', 'Credits']} 
          data={users.map(user => ({ Email: user.email, Credits: user.credits || 0 }))} 
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="modal-header">
          <h2>Add New Project</h2>
          <button onClick={closeModal} className="close-modal-btn">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <form className="modal-form">
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input type="text" id="projectName" placeholder="Enter project name" />
            </div>
            <div className="form-group">
              <label htmlFor="client">Client</label>
              <input type="text" id="client" placeholder="Enter client name" />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status">
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">Create Project</button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;