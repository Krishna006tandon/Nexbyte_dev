import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
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
            <input type="email" id="email" defaultValue={user.email} />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input type="password" id="password" placeholder="Enter new password" />
          </div>
          <button type="submit" className="submit-btn">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;