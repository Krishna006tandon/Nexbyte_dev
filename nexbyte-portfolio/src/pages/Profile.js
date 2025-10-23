import React from 'react';
import './Profile.css';
import '../components/Form.css'; // Reusing form styles

const Profile = () => {
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
            <h2>Alex Doe</h2>
            <p>alex.doe@example.com</p>
          </div>
        </div>

        <form className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" defaultValue="Alex Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" defaultValue="alex.doe@example.com" />
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