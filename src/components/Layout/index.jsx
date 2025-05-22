// src/components/Layout/index.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavMenu from '../NavMenu';
import './styles.css';

const Layout = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 助手</h1>
        <p className="app-subtitle">由 DeepSeek AI 提供支持</p>
        <NavMenu />
      </header>
      
      <main className="app-main">
        <Outlet />
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} AI Assistant</p>
      </footer>
    </div>
  );
};

export default Layout;