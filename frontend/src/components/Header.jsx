import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <nav className="nav-container">
        <div className="logo">
          <Link to="/">CardioIA</Link>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Evaluación
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;