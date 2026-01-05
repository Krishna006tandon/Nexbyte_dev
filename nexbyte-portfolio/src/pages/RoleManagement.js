import React, { useState } from 'react';
import './RoleManagement.css';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Web Development Intern',
      description: 'Learn full-stack web development with React, Node.js, and modern frameworks',
      duration: '3 months',
      isActive: true,
      requirements: 'Basic HTML, CSS, JavaScript knowledge',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
      mentor: 'John Doe',
      maxInterns: 5,
      currentInterns: 2
    },
    {
      id: 2,
      name: 'Frontend Intern',
      description: 'Focus on modern frontend technologies and UI/UX best practices',
      duration: '2 months',
      isActive: true,
      requirements: 'HTML, CSS, JavaScript basics',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'TailwindCSS'],
      mentor: 'Jane Smith',
      maxInterns: 3,
      currentInterns: 1
    },
    {
      id: 3,
      name: 'Backend Intern',
      description: 'Learn server-side development, databases, and API design',
      duration: '3 months',
      isActive: true,
      requirements: 'Basic programming knowledge',
      skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs'],
      mentor: 'Mike Johnson',
      maxInterns: 4,
      currentInterns: 0
    },
    {
      id: 4,
      name: 'UI/UX Intern',
      description: 'Design beautiful user interfaces and improve user experience',
      duration: '2 months',
      isActive: false,
      requirements: 'Basic design knowledge',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      mentor: 'Sarah Wilson',
      maxInterns: 2,
      currentInterns: 0
    },
    {
      id: 5,
      name: 'Digital Marketing Intern',
      description: 'Learn digital marketing strategies and campaign management',
      duration: '2 months',
      isActive: true,
      requirements: 'Basic marketing knowledge',
      skills: ['SEO', 'Social Media Marketing', 'Content Marketing', 'Google Analytics'],
      mentor: 'Tom Brown',
      maxInterns: 3,
      currentInterns: 1
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    duration: '3 months',
    isActive: true,
    requirements: '',
    skills: [],
    mentor: '',
    maxInterns: 3
  });

  const [skillInput, setSkillInput] = useState('');

  const handleAddRole = () => {
    const role = {
      ...newRole,
      id: Date.now(),
      currentInterns: 0
    };
    setRoles([...roles, role]);
    setNewRole({
      name: '',
      description: '',
      duration: '3 months',
      isActive: true,
      requirements: '',
      skills: [],
      mentor: '',
      maxInterns: 3
    });
    setShowAddModal(false);
    setSkillInput('');
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowEditModal(true);
    setSkillInput(role.skills.join(', '));
  };

  const handleUpdateRole = () => {
    setRoles(roles.map(role => 
      role.id === editingRole.id 
        ? { ...editingRole, skills: skillInput.split(',').map(s => s.trim()).filter(s => s) }
        : role
    ));
    setShowEditModal(false);
    setEditingRole(null);
    setSkillInput('');
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handleToggleActive = (roleId) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, isActive: !role.isActive }
        : role
    ));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      const skills = skillInput.split(',').map(s => s.trim()).filter(s => s);
      if (showAddModal) {
        setNewRole({ ...newRole, skills });
      } else if (showEditModal) {
        setEditingRole({ ...editingRole, skills });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    if (showAddModal) {
      setNewRole({
        ...newRole,
        skills: newRole.skills.filter((_, i) => i !== index)
      });
    } else if (showEditModal) {
      setEditingRole({
        ...editingRole,
        skills: editingRole.skills.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="role-management">
      <div className="management-header">
        <h1>Internship Role Management</h1>
        <button onClick={() => setShowAddModal(true)} className="add-role-btn">
          ➕ Add New Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className={`role-card ${!role.isActive ? 'inactive' : ''}`}>
            <div className="role-header">
              <h3>{role.name}</h3>
              <div className="role-actions">
                <button 
                  onClick={() => handleEditRole(role)}
                  className="action-btn edit-btn"
                  title="Edit Role"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleToggleActive(role.id)}
                  className={`action-btn toggle-btn ${role.isActive ? 'active' : 'inactive'}`}
                  title={role.isActive ? 'Deactivate' : 'Activate'}
                >
                  {role.isActive ? '🔴' : '🟢'}
                </button>
                <button 
                  onClick={() => handleDeleteRole(role.id)}
                  className="action-btn delete-btn"
                  title="Delete Role"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="role-content">
              <p className="role-description">{role.description}</p>
              
              <div className="role-details">
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{role.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Mentor:</span>
                  <span className="value">{role.mentor}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Capacity:</span>
                  <span className="value">{role.currentInterns}/{role.maxInterns}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${role.isActive ? 'active' : 'inactive'}`}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="role-requirements">
                <h4>Requirements:</h4>
                <p>{role.requirements}</p>
              </div>

              <div className="role-skills">
                <h4>Skills to Learn:</h4>
                <div className="skills-list">
                  {role.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Role</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Web Development Intern"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Duration *</label>
                <select
                  value={newRole.duration}
                  onChange={(e) => setNewRole({ ...newRole, duration: e.target.value })}
                  className="form-select"
                >
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe what interns will learn and do..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Requirements *</label>
                <input
                  type="text"
                  value={newRole.requirements}
                  onChange={(e) => setNewRole({ ...newRole, requirements: e.target.value })}
                  placeholder="Basic knowledge required..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mentor *</label>
                <input
                  type="text"
                  value={newRole.mentor}
                  onChange={(e) => setNewRole({ ...newRole, mentor: e.target.value })}
                  placeholder="Mentor name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Max Interns *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newRole.maxInterns}
                  onChange={(e) => setNewRole({ ...newRole, maxInterns: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Skills (Press Enter to add)</label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleAddSkill}
                  placeholder="Enter skills separated by commas..."
                  className="form-input"
                />
                <div className="skills-preview">
                  {newRole.skills.map((skill, index) => (
                    <span key={index} className="skill-tag removable">
                      {skill}
                      <button onClick={() => handleRemoveSkill(index)} className="remove-skill">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleAddRole} className="save-btn">
                Add Role
              </button>
              <button onClick={() => {
                setShowAddModal(false);
                setNewRole({
                  name: '',
                  description: '',
                  duration: '3 months',
                  isActive: true,
                  requirements: '',
                  skills: [],
                  mentor: '',
                  maxInterns: 3
                });
                setSkillInput('');
              }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Role</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Duration *</label>
                <select
                  value={editingRole.duration}
                  onChange={(e) => setEditingRole({ ...editingRole, duration: e.target.value })}
                  className="form-select"
                >
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Requirements *</label>
                <input
                  type="text"
                  value={editingRole.requirements}
                  onChange={(e) => setEditingRole({ ...editingRole, requirements: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mentor *</label>
                <input
                  type="text"
                  value={editingRole.mentor}
                  onChange={(e) => setEditingRole({ ...editingRole, mentor: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Max Interns *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingRole.maxInterns}
                  onChange={(e) => setEditingRole({ ...editingRole, maxInterns: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Skills (Press Enter to add)</label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleAddSkill}
                  placeholder="Enter skills separated by commas..."
                  className="form-input"
                />
                <div className="skills-preview">
                  {editingRole.skills.map((skill, index) => (
                    <span key={index} className="skill-tag removable">
                      {skill}
                      <button onClick={() => handleRemoveSkill(index)} className="remove-skill">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleUpdateRole} className="save-btn">
                Update Role
              </button>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingRole(null);
                setSkillInput('');
              }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
