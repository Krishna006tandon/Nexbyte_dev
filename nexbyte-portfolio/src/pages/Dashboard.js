import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiUsers, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import './Dashboard.css';
import Modal from '../components/Modal';
import Worklist from '../components/Worklist';
import axios from 'axios';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [tasksRes, usersRes] = await Promise.all([
          axios.get('/api/tasks', { headers: { 'x-auth-token': token } }),
          axios.get('/api/users', { headers: { 'x-auth-token': token } })
        ]);
        setTasks(tasksRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddTask = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/tasks', task, { headers: { 'x-auth-token': token } });
      setTasks([res.data, ...tasks]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/tasks/${id}`, updates, { headers: { 'x-auth-token': token } });
      setTasks(tasks.map(task => (task._id === id ? res.data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${id}`, { headers: { 'x-auth-token': token } });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

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
            <h2>{tasks.filter(task => task.status !== 'Done').length}</h2>
            <p>Active Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <div className="stat-info">
            <h2>{users.length}</h2>
            <p>Users</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-info">
            <h2>{tasks.filter(task => task.status === 'Done').length}</h2>
            <p>Completed Tasks</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <Worklist 
          tasks={tasks} 
          members={users} 
          onAddTask={handleAddTask} 
          onUpdateTask={handleUpdateTask} 
          onDeleteTask={handleDeleteTask} 
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