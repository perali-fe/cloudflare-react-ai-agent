// src/pages/HomePage/index.jsx
import React from 'react';
import Chat from '../../components/Chat';
import './styles.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Chat />
    </div>
  );
};

export default HomePage;