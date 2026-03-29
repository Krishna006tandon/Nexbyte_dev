import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeSidebar from './HomeSidebar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <HomeSidebar />
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
