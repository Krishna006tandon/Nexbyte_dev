import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiUsers, FiBriefcase, FiCheckCircle, FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';
import Modal from '../components/Modal';
import Worklist from '../components/Worklist';
import DataTable from '../components/DataTable';
import axios from 'axios';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

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

  // Fetch tasks when a project is selected
  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const tasksRes = await axios.get(`/api/tasks?projectId=${selectedProject._id}`, { headers: { 'x-auth-token': token } });
        setTasks(tasksRes.data);
      } catch (error) {
        console.error(`Error fetching tasks for project ${selectedProject._id}:`, error);
      }
    };
    fetchTasks();
  }, [selectedProject]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const project = projects.find(p => p._id === projectId);
    setSelectedProject(project);
  };

  const handleAddTask = async (task) => {
    if (!selectedProject) {
      console.error('Cannot add task without a selected project.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const taskWithProjectId = { ...task, projectId: selectedProject._id };
      const res = await axios.post('/api/tasks', taskWithProjectId, { headers: { 'x-auth-token': token } });
      setTasks([res.data, ...tasks]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    console.log('Updating task:', id, updates);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/tasks/${id}`, updates, { headers: { 'x-auth-token': token } });
      console.log('Task updated, response:', res.data);
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => (task._id === id ? res.data : task));
        console.log('New tasks state:', newTasks);
        return newTasks;
      });
      if (updates.status === 'Done') {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };



  // Budget calculations
  const totalBudget = selectedProject?.totalBudget || 0;
  const availableBudget = totalBudget * 0.7;
  const spentBudget = tasks.reduce((acc, task) => acc + (task.cost || 0), 0);
  const remainingBudget = availableBudget - spentBudget;

  // Task filtering
  const activeTasks = tasks.filter(task => task.status !== 'Done');
  const completedTasks = tasks.filter(task => task.status === 'Done');

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
          {/* Task Stats */}
          <div className="stat-card">
            <FiBriefcase className="stat-icon" />
            <div className="stat-info">
              <h2>{activeTasks.length}</h2>
              <p>Active Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <FiCheckCircle className="stat-icon" />
            <div className="stat-info">
              <h2>{completedTasks.length}</h2>
              <p>Completed Tasks</p>
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
        <h2>Active Tasks</h2>
        <Worklist 
          tasks={activeTasks} 
          members={users} 
          onAddTask={handleAddTask} 
          onUpdateTask={handleUpdateTask} 
        />
      </div>

      <div className="table-section">
        <h2>Completed Tasks</h2>
        <DataTable 
          columns={['Description', 'Assigned To', 'Completed At', 'Cost']}
          data={completedTasks.map(task => ({
            Description: task.description,
            'Assigned To': task.assignedTo?.email || 'N/A',
            'Completed At': new Date(task.completedAt).toLocaleDateString(),
            Cost: `${task.cost || 0}`
          }))} 
        />
      </div>

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