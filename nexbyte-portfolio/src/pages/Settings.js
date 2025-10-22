import React from 'react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-card">
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label htmlFor="email-notifications">Email Notifications</label>
            <label className="toggle-switch">
              <input type="checkbox" id="email-notifications" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label htmlFor="push-notifications">Push Notifications</label>
            <label className="toggle-switch">
              <input type="checkbox" id="push-notifications" />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Theme</h2>
          <div className="setting-item">
            <label htmlFor="dark-mode">Dark Mode</label>
            <label className="toggle-switch">
              <input type="checkbox" id="dark-mode" defaultChecked disabled/>
              <span className="slider"></span>
            </label>
          </div>
           <p>Currently, only dark mode is available.</p>
        </div>

         <div className="settings-section">
          <h2>Language</h2>
          <div className="setting-item">
            <label htmlFor="language">Language</label>
            <select id="language" style={{padding: '0.5rem', borderRadius: 'var(--border-radius)'}}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;