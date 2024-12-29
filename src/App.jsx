import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange, logout } from './firebase/authService';
import { db } from './firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Login from './components/Login';
import AdminPage from './pages/Admin/Admin';
import AddEvent from './pages/FormEvents/AddEvent';
import Navbar from './components/Navbar/Navbar';
import EventList from './components/Events/EventList';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
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
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      {!loading && (
        <>
          <Navbar user={user} onLogout={handleLogout} userRole={userRole} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<EventList user={user} />} />
              <Route
                path="/ajouter"
                element={
                  user ? <AddEvent user={user} /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/admin"
                element={
                  user && userRole === 'admin' ? (
                    <AdminPage />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/" /> : <Login />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
