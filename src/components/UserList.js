import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

export default function UserList({ currentUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Csak hitelesített felhasználók lekérése
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, is_online, last_seen')
        .neq('id', currentUser.id)
        .not('email', 'is', null);
      if (!error && data) {
        // Szűrjük a hitelesített felhasználókat
        const confirmedUsers = data.filter((user) => {
          // Ellenőrizzük, hogy a last_seen alapján online-e (5 percen belüli aktivitás)
          const lastSeen = new Date(user.last_seen);
          const now = new Date();
          const isOnline = user.is_online && (now - lastSeen) / 1000 / 60 < 5;
          return isOnline !== undefined; // Csak létező felhasználókat tartunk meg
        });
        setUsers(confirmedUsers);
      } else if (error) {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
      }
    };

    fetchUsers();

    // Valós idejű frissítések
    const subscription = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    // Online státusz frissítése
    supabase
      .from('users')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', currentUser.id)
      .then();

    // Böngésző bezárásakor offline státusz
    const handleBeforeUnload = () => {
      supabase
        .from('users')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id)
        .then();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      supabase
        .from('users')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id)
        .then();
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  return (
    <div className="user-list">
      <h2>Felhasználók</h2>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li
              key={user.id}
              className={user.is_online ? 'online' : 'offline'}
              onClick={() => setSelectedUser(user)}
            >
              {user.username} {user.is_online ? '(Online)' : '(Offline)'}
            </li>
          ))
        ) : (
          <li>Nincsenek elérhető felhasználók</li>
        )}
      </ul>
    </div>
  );
}