// src/components/NavMenu/index.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';

const NavMenu = () => {
  return (
    <nav className="nav-menu">
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? 'nav-link active' : 'nav-link'
            }
            end
          >
            首页
          </NavLink>
        </li>
        
        {/* 这里可以添加其他现有导航项 */}
        
        <li className="nav-item">
          <NavLink 
            to="/ai-code-review" 
            className={({ isActive }) => 
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <span className="icon">🤖</span>
            AI 代码审查
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavMenu;