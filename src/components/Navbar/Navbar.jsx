import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import './Navbar.css';

function Navbar({ user, userRole, onLogout }) {
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="logo">
          LGDV Événements
        </Link>
        
        <div className="nav-links">
          <Link to="/ajouter" className="add-button">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4v12M4 10h12" strokeLinecap="round"/>
            </svg>
            Ajouter
          </Link>
          
          {userRole === 'admin' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                isActive ? styles.activeLink : styles.link
              }
            >
              Administration
            </NavLink>
          )}
          
          <button 
            className="logout-button"
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.object,
  userRole: PropTypes.string,
  onLogout: PropTypes.func.isRequired
};

export default Navbar;
