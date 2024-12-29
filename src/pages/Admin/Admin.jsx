import { useState, useEffect } from 'react';
import { getAllowedUsers, addAllowedUser, updateUserRole, deleteAllowedUser } from '../../firebase/allowedUsers';
import styles from './Admin.module.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const fetchedUsers = await getAllowedUsers();
    setUsers(fetchedUsers);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addAllowedUser(newUser.email, newUser.role);
      setNewUser({ email: '', role: 'user' });
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (email, newRole) => {
    try {
      await updateUserRole(email, newRole);
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
    }
  };

  const handleDeleteUser = async (email) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await deleteAllowedUser(email);
        await fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <h1 className={styles.adminTitle}>Administration</h1>
        </header>

        <main className={styles.userManagementSection}>
          <h2 className={styles.sectionTitle}>Gestion des utilisateurs</h2>
          
          <form onSubmit={handleAddUser} className={styles.addUserForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email de l'utilisateur</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  placeholder="exemple@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Rôle</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter l'utilisateur"}
            </button>
          </form>

          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleUpdateRole(user.email, user.role === 'admin' ? 'user' : 'admin')}
                      className={styles.editButton}
                    >
                      Changer le rôle
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className={styles.deleteButton}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
