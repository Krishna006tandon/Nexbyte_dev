import React, { useState } from 'react';
import './Worklist.css';
import Modal from './Modal';

const Worklist = ({ tasks, members, onAddTask, onUpdateTask, onDeleteTask }) => {
  console.log('Members in Worklist:', members);
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [cost, setCost] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
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
            <tr key={task._id} onClick={() => handleTaskClick(task)} className="clickable-row">
              <td>{task.description}</td>
              <td>{task.assignedTo.email}</td>
              <td>{task.cost}</td>
              <td>{new Date(task.deadline).toLocaleDateString()}</td>
              <td>{task.status}</td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedTask && editingTask && (
          <div>
            <h2>Edit Task</h2>
            <form>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select
                  value={editingTask.assignedTo._id}
                  onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                >
                  {members.map(member => (
                    <option key={member._id} value={member._id}>{member.email}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cost</label>
                <input
                  type="number"
                  value={editingTask.cost}
                  onChange={(e) => setEditingTask({ ...editingTask, cost: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={new Date(editingTask.deadline).toISOString().split('T')[0]}
                  onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                />
              </div>
              <button type="button" onClick={() => onUpdateTask(selectedTask._id, editingTask)} className="btn btn-primary">Save</button>
              <button type="button" onClick={() => onDeleteTask(selectedTask._id)} className="btn btn-danger">Delete</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Worklist;
