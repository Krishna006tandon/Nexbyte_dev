import React, { useState } from 'react';
import './Worklist.css';

const Worklist = ({ tasks, members, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!description || !assignedTo) {
      return;
    }
    onAddTask({ description, assignedTo });
    setDescription('');
    setAssignedTo('');
  };

  const workSummary = members.map(member => {
    const memberTasks = tasks.filter(task => task.assignedTo._id === member._id);
    return {
      ...member,
      total: memberTasks.length,
      done: memberTasks.filter(task => task.status === 'Done').length,
    };
  });

  return (
    <div className="worklist-container">
      <div className="worklist-summary">
        <h3>Work Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Tasks</th>
              <th>Tasks Done</th>
            </tr>
          </thead>
          <tbody>
            {workSummary.map(summary => (
              <tr key={summary._id}>
                <td>{summary.email}</td>
                <td>{summary.total}</td>
                <td>{summary.done}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
            <option value="">Assign to...</option>
            {members.map(member => (
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
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.description}</td>
              <td>{task.assignedTo.email}</td>
              <td>{task.status}</td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => onUpdateTask(task._id, { status: 'Done' })} className="btn btn-success" style={{ marginRight: '5px' }}>Mark as Done</button>
                <button onClick={() => onDeleteTask(task._id)} className="btn btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Worklist;
