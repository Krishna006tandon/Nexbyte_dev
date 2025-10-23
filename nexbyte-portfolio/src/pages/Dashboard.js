import React, { useState } from 'react';
import { FiPlus, FiX, FiUsers, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import './Dashboard.css';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const projectsData = [
    { id: 1, name: 'Project Alpha', status: 'Completed', client: 'Client A' },
    { id: 2, name: 'Project Beta', status: 'In Progress', client: 'Client B' },
    { id: 3, name: 'Project Gamma', status: 'Pending', client: 'Client C' },
  ];

  const projectColumns = ['ID', 'Name', 'Status', 'Client'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="add-project-btn" onClick={openModal}>
          <FiPlus />
          Add New Project
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <FiBriefcase className="stat-icon" />
          <div className="stat-info">
            <h2>12</h2>
            <p>Active Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <div className="stat-info">
            <h2>5</h2>
            <p>Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-info">
            <h2>25</h2>
            <p>Completed Projects</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <h2>Recent Projects</h2>
        <DataTable columns={projectColumns} data={projectsData} />
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