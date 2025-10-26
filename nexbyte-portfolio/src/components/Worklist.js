import React, { useState } from 'react';
import './Worklist.css';
import Table from './Table';

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

  const summaryHeaders = ['Member', 'Total Tasks', 'Tasks Done'];
  const summaryData = workSummary.map(summary => ({'email': summary.email, 'total': summary.total, 'done': summary.done}));

  const taskHeaders = ['Description', 'Assigned To', 'Status', 'Created At', 'Action'];
  const taskData = tasks.map(task => ({
    'description': task.description,
    'assignedTo': task.assignedTo.email,
    'status': task.status,
    'createdAt': new Date(task.createdAt).toLocaleString(),
    'action': <>
        <button onClick={() => onUpdateTask(task._id, { status: 'Done' })} className="btn btn-success" style={{ marginRight: '5px' }}>Mark as Done</button>
        <button onClick={() => onDeleteTask(task._id)} className="btn btn-danger">Delete</button>
    </>
  }));

  return (
    <div className="worklist-container">
      <div className="worklist-summary">
        <h3>Work Summary</h3>
        <Table headers={summaryHeaders} data={summaryData} />
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
      <Table headers={taskHeaders} data={taskData} />
    </div>
  );
};

export default Worklist;
