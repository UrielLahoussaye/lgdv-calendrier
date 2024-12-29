import PropTypes from 'prop-types';
import './Navbar.css';

function Navbar({ userRole, showAdmin, onAdminClick, onLogout }) {
  return (
    <header className="navbar">
      <h1><a href="/">LGDV Événements</a></h1>
      <div className="navbar-right">
        {userRole === 'admin' && (
          <button 
            className="admin-button"
            onClick={onAdminClick}
          >
            {showAdmin ? 'Retour à l\'accueil' : 'Administration'}
          </button>
        )}
        <button 
          className="logout-button"
          onClick={onLogout}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  userRole: PropTypes.string,
  showAdmin: PropTypes.bool.isRequired,
  onAdminClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};

export default Navbar;
