import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Login from './components/Login.js';
import UserList from './components/UserList.js';
import Chat from './components/Chat.js';
import { supabase } from './supabaseClient.js';
import './styles.css';

// Fő alkalmazás komponens
function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Ellenőrizzük az aktív session-t
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.confirmed_at) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Figyeljük az autentikációs változásokat
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.confirmed_at) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedUser(null);
  };

  return (
    <div className="app">
      {user ? (
        <div className="main-container">
          <button className="signout-button" onClick={handleSignOut}>
            Kijelentkezés
          </button>
          <UserList currentUser={user} setSelectedUser={setSelectedUser} />
          <Chat currentUser={user} selectedUser={selectedUser} />
        </div>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

// Email megerősítő komponens
function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          console.error('Hiba az email megerősítése közben:', error.message);
          navigate('/auth/error');
        } else {
          navigate('/'); // Sikeres megerősítés esetén vissza a főoldalra
        }
      } else {
        navigate('/auth/error'); // Érvénytelen link esetén
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return <div>Email megerősítése folyamatban...</div>;
}

// Hibakezelő komponens
function AuthError() {
  return (
    <div className="app">
      <h2>Hiba történt</h2>
      <p>Az email megerősítése nem sikerült. Kérjük, próbáld újra, vagy lépj kapcsolatba a támogatással: <a href="mailto:support@blawgify.com">support@blawgify.com</a></p>
    </div>
  );
}

// Router konfiguráció
function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/error" element={<AuthError />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<AppWithRouter />);