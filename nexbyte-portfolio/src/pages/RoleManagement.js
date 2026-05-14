import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './RoleManagement.css';

const emptyRole = {
  name: '',
  description: '',
  duration: '3 months',
  isActive: true,
  requirements: '',
  skills: [],
  mentor: '',
  maxInterns: 3
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState(emptyRole);
  const [skillInput, setSkillInput] = useState('');

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token');
    return { headers: { 'x-auth-token': token } };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/internship/roles');
        if (!isMounted) return;
        setRoles(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load roles');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  const resetAddForm = () => {
    setNewRole(emptyRole);
    setSkillInput('');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRole(null);
    setSkillInput('');
  };

  const handleAddRole = async () => {
    try {
      if (!newRole.name.trim() || !newRole.description.trim()) {
        alert('Role name and description are required');
        return;
      }

      const payload = {
        ...newRole,
        skills: Array.isArray(newRole.skills) ? newRole.skills : [],
        isActive: newRole.isActive !== false
      };

      const res = await axios.post('/api/internship/roles', payload, authHeaders);
      setRoles(prev => [...prev, res.data]);
      setShowAddModal(false);
      resetAddForm();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add role');
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowEditModal(true);
    setSkillInput((role.skills || []).join(', '));
  };

  const handleUpdateRole = async () => {
    try {
      if (!editingRole?.name?.trim() || !editingRole?.description?.trim()) {
        alert('Role name and description are required');
        return;
      }

      const payload = {
        ...editingRole,
        skills: skillInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await axios.put(`/api/internship/roles/${editingRole.id}`, payload, authHeaders);
      setRoles(prev => prev.map(r => (r.id === editingRole.id ? res.data : r)));
      closeEditModal();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`/api/internship/roles/${roleId}`, authHeaders);
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleToggleActive = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    try {
      const res = await axios.put(
        `/api/internship/roles/${roleId}`,
        { isActive: !role.isActive },
        authHeaders
      );
      setRoles(prev => prev.map(r => (r.id === roleId ? res.data : r)));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update role status');
    }
  };

  const handleSkillsKeyDown = (e, mode) => {
    if (e.key !== 'Enter') return;
    if (!skillInput.trim()) return;
    e.preventDefault();

    const skills = skillInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (mode === 'add') {
      setNewRole(prev => ({ ...prev, skills }));
    } else if (mode === 'edit') {
      setEditingRole(prev => ({ ...prev, skills }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (index, mode) => {
    if (mode === 'add') {
      setNewRole(prev => ({ ...prev, skills: (prev.skills || []).filter((_, i) => i !== index) }));
    } else if (mode === 'edit') {
      setEditingRole(prev => ({ ...prev, skills: (prev.skills || []).filter((_, i) => i !== index) }));
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

      <div className="roles-grid">
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.8)' }}>Loading roles...</div>
        ) : error ? (
          <div style={{ color: '#ff6b6b' }}>{error}</div>
        ) : roles.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.8)' }}>No roles found.</div>
        ) : (
          roles.map(role => (
            <div key={role.id} className={`role-card ${!role.isActive ? 'inactive' : ''}`}>
              <div className="role-header">
                <h3>{role.name}</h3>
                <div className="role-actions">
                  <button onClick={() => handleEditRole(role)} className="action-btn edit-btn" title="Edit Role">
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
                    <span className="value">
                      {role.currentInterns || 0}/{role.maxInterns}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${role.isActive ? 'active' : 'inactive'}`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="role-requirements">
                  <h4>Requirements</h4>
                  <p>{role.requirements}</p>
                </div>

                <div className="role-skills">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {(role.skills || []).map((skill, idx) => (
                      <span key={`${role.id}-${idx}`} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mentor *</label>
                <input
                  type="text"
                  value={newRole.mentor}
                  onChange={(e) => setNewRole({ ...newRole, mentor: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Max Interns *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newRole.maxInterns}
                  onChange={(e) => setNewRole({ ...newRole, maxInterns: parseInt(e.target.value, 10) || 1 })}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Skills (Press Enter to add)</label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => handleSkillsKeyDown(e, 'add')}
                  placeholder="Enter skills separated by commas..."
                  className="form-input"
                />
                <div className="skills-preview">
                  {(newRole.skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag removable">
                      {skill}
                      <button onClick={() => handleRemoveSkill(index, 'add')} className="remove-skill" type="button">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleAddRole} className="save-btn">
                Add Role
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                  max="50"
                  value={editingRole.maxInterns}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, maxInterns: parseInt(e.target.value, 10) || 1 })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Skills (Press Enter to add)</label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => handleSkillsKeyDown(e, 'edit')}
                  placeholder="Enter skills separated by commas..."
                  className="form-input"
                />
                <div className="skills-preview">
                  {(editingRole.skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag removable">
                      {skill}
                      <button onClick={() => handleRemoveSkill(index, 'edit')} className="remove-skill" type="button">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleUpdateRole} className="save-btn">
                Update Role
              </button>
              <button onClick={closeEditModal} className="cancel-btn">
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

