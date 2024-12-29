import { useState, useEffect } from 'react';
import { getAllowedUsers, addAllowedUser, updateUserRole, deleteAllowedUser } from '../firebase/allowedUsers';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allowedUsers = await getAllowedUsers();
      setUsers(allowedUsers);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await addAllowedUser(newEmail.toLowerCase(), newRole);
      setNewEmail('');
      setNewRole('user');
      loadUsers();
    } catch (error) {
      setError('Erreur lors de l\'ajout de l\'utilisateur');
      console.error(error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      setError('Erreur lors de la modification du rôle');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteAllowedUser(userId);
        loadUsers();
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        console.error(error);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="admin-panel">
      <h2>Gestion des Utilisateurs</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleAddUser} className="add-user-form">
        <h3>Ajouter un utilisateur</h3>
        <div className="form-group">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
          <button type="submit">Ajouter</button>
        </div>
      </form>

      <div className="users-list">
        <h3>Utilisateurs autorisés</h3>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-button"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
