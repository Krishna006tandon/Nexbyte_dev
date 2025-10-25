import React, { useState } from 'react';
import './Worklist.css';

const Worklist = ({ tasks, members, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [cost, setCost] = useState('');
  const [deadline, setDeadline] = useState('');
  const [pendingChanges, setPendingChanges] = useState({});

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!description || !assignedTo || !cost || !deadline) {
      return;
    }
    onAddTask({ description, assignedTo, cost, deadline });
    setDescription('');
    setAssignedTo('');
    setCost('');
    setDeadline('');
  };

  const handleStatusChange = (taskId, newStatus) => {
    setPendingChanges({
      ...pendingChanges,
      [taskId]: {
        ...pendingChanges[taskId],
        status: newStatus,
      },
    });
  };

  const handleAssignedToChange = (taskId, newAssignedTo) => {
    setPendingChanges({
      ...pendingChanges,
      [taskId]: {
        ...pendingChanges[taskId],
        assignedTo: newAssignedTo,
      },
    });
  };

  const handleSave = (taskId) => {
    onUpdateTask(taskId, pendingChanges[taskId]);
    setPendingChanges({
      ...pendingChanges,
      [taskId]: undefined,
    });
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
              <td>
                <select value={pendingChanges[task._id]?.assignedTo || task.assignedTo._id} onChange={(e) => handleAssignedToChange(task._id, e.target.value)}>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>{member.email}</option>
                  ))}
                </select>
              </td>
              <td>{task.cost}</td>
              <td>{new Date(task.deadline).toLocaleDateString()}</td>
              <td>
                <select value={pendingChanges[task._id]?.status || task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleSave(task._id)} className="btn btn-primary" disabled={!pendingChanges[task._id]}>Save</button>
                <button onClick={() => onDeleteTask(task._id)} className="btn btn-danger" style={{ marginLeft: '5px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Worklist;
