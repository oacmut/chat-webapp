import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './components/Login.js';
import UserList from './components/UserList.js';
import Chat from './components/Chat.js';
import { supabase } from './supabaseClient.js';
import './styles.css';

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

const root = createRoot(document.getElementById('root'));
root.render(<App />);