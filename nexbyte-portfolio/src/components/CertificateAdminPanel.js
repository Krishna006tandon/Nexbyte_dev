import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CertificateAdminPanel = () => {
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  
  // Form states for Add new certificate
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'INT',
    studentName: '',
    email: '',
    programName: '',
    awardName: '',
    issueDate: '',
    internshipDuration: ''
  });

  // Get token helper
  const getToken = () => localStorage.getItem('token') || '';

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/certificates/all', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.data.success) {
        setCertificates(res.data.certificates);
        setStats({ total: res.data.total, verified: res.data.verified });
      }
    } catch (err) {
      console.error('Error fetching certificates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/certificate', formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.data.success) {
        setShowAddForm(false);
        fetchCertificates();
      }
    } catch (err) {
      console.error('Error adding certificate', err);
      alert('Failed to add certificate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await axios.delete(`/api/certificate/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchCertificates();
    } catch (err) {
      console.error('Error deleting', err);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return;
    try {
      await axios.put(`/api/certificate/${id}`, { status: 'Revoked' }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchCertificates();
    } catch (err) {
      console.error('Error revoking', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Certificate Management (Admin)</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Total Issued</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A' }}>{stats.total}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Valid Certificates</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16A34A' }}>{stats.verified}</p>
        </div>
      </div>

      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        style={{ padding: '10px 20px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
      >
        {showAddForm ? 'Cancel' : 'Issue New Certificate'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} style={{ padding: '20px', backgroundColor: '#f1f5f9', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>Issue Certificate</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder="Student Name" required onChange={e => setFormData({...formData, studentName: e.target.value})} />
            <input placeholder="Email" type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Program Name (e.g. Software Development Internship)" required onChange={e => setFormData({...formData, programName: e.target.value})} />
            <input placeholder="Award Name (Optional)" onChange={e => setFormData({...formData, awardName: e.target.value})} />
            <input placeholder="Issue Date" type="date" required onChange={e => setFormData({...formData, issueDate: e.target.value})} />
            <input placeholder="Duration (e.g. 15 June 2026 - 20 July 2026)" required onChange={e => setFormData({...formData, internshipDuration: e.target.value})} />
            <select onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="INT">Internship (INT)</option>
              <option value="HCK">Hackathon (HCK)</option>
              <option value="WKS">Workshop (WKS)</option>
              <option value="TRN">Training (TRN)</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#16A34A', color: 'white', border: 'none', padding: '10px' }}>Generate Certificate</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#1E3A8A', color: 'white' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Program</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map(cert => (
              <tr key={cert._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{cert.certificateId}</td>
                <td style={{ padding: '12px' }}>{cert.studentName}</td>
                <td style={{ padding: '12px' }}>{cert.programName}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    color: cert.status === 'Valid' ? 'green' : 'red', 
                    fontWeight: 'bold' 
                  }}>{cert.status}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => window.open(`/certificate/${cert.certificateId}`, '_blank')} style={{ marginRight: '10px' }}>View</button>
                  {cert.status === 'Valid' && (
                    <button onClick={() => handleRevoke(cert.certificateId)} style={{ marginRight: '10px', color: 'orange' }}>Revoke</button>
                  )}
                  <button onClick={() => handleDelete(cert.certificateId)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CertificateAdminPanel;
