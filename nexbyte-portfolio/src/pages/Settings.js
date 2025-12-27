import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not an intern
  if (!user || user.role !== 'intern') {
    navigate('/login');
    return null;
  }

  return (
    <div className="settings-page-container">
      <div className="main-content">
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
              <p className="theme-note">Currently, only dark mode is available.</p>
            </div>

            <div className="settings-section">
              <h2>Language</h2>
              <div className="setting-item">
                <label htmlFor="language">Language</label>
                <select id="language" className="language-select">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <div className="settings-actions">
              <button type="button" className="btn-save">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;