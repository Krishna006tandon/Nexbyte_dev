import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';
import '../components/Form.css'; // Reusing form styles

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/profile', { headers: { 'x-auth-token': token } });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  if (!authUser || !user) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect if not an intern
  if (authUser.role !== 'intern') {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page-container">
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
          </div>

          <div className="profile-card">
            <div className="profile-info">
              <img 
                src="https://i.pravatar.cc/150?img=32" // Placeholder avatar
                alt="User Avatar" 
                className="profile-avatar" 
              />
              <div className="profile-details">
                <h2>{user.email}</h2>
                <p>Credits: {user.credits}</p>
              </div>
            </div>

            <form className="profile-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" defaultValue={user.email} readOnly />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;