import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../components/Worklist.css'; // Reusing the same CSS for now
import { AuthContext } from '../context/AuthContext';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [cost, setCost] = useState('');
  const [deadline, setDeadline] = useState('');
  const { fetchUser } = useContext(AuthContext);

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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!description || !assignedTo || !cost || !deadline) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/tasks', { description, assignedTo, cost, deadline }, { headers: { 'x-auth-token': token } });
      setTasks([res.data, ...tasks]);
      setDescription('');
      setAssignedTo('');
      setCost('');
      setDeadline('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/tasks/${id}`, updates, { headers: { 'x-auth-token': token } });
      setTasks(tasks.map(task => (task._id === id ? res.data : task)));
      if (updates.status === 'Done') {
        fetchUser();
      }
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
    <div className="worklist-container">
      <div className="form-container">
        <form onSubmit={handleAddTask}>
          <h3>Create New Task</h3>
          <input
            type="text"
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
            <option value="">Assign to...</option>
            {users.map(member => (
              <option key={member._id} value={member._id}>{member.email}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Add Task</button>
        </form>
      </div>

      <h3>All Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Cost</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.description}</td>
              <td>{task.assignedTo?.email}</td>
              <td>{task.cost}</td>
              <td>{new Date(task.deadline).toLocaleDateString()}</td>
              <td>
                <select value={task.status} onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
