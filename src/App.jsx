import { useState, useEffect } from 'react';
import { onAuthStateChange, logout } from './firebase/authService';
import { db } from './firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar/Navbar';
import EventList from './components/Events/EventList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        // Vérifier le rôle de l'utilisateur
        try {
          const q = query(
            collection(db, 'allowedUsers'),
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserRole(querySnapshot.docs[0].data().role);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du rôle:", error);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <Navbar 
        userRole={userRole}
        showAdmin={showAdmin}
        onAdminClick={() => setShowAdmin(!showAdmin)}
        onLogout={handleLogout}
      />
      {showAdmin && userRole === 'admin' ? (
        <AdminPanel />
      ) : (
        <main className="main-content">
          <EventList user={user} />
        </main>
      )}
    </div>
  );
}

export default App;
