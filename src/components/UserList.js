import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

export default function UserList({ currentUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    // 1️⃣ Lekérjük az összes többi felhasználót
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, last_seen')
      .neq('id', currentUser.id)
      .not('email', 'is', null);

    if (userError) {
      console.error('Hiba a felhasználók lekérdezésekor:', userError);
      return;
    }

    // 2️⃣ Lekérjük az összes olvasatlan üzenetet, ahol én vagyok a címzett
    const { data: unreadData, error: unreadError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', currentUser.id)
      .eq('is_read', false);

    if (unreadError) {
      console.error('Hiba az olvasatlan üzenetek lekérdezésekor:', unreadError);
      return;
    }

    // 3️⃣ Összeszámoljuk felhasználónként
    const unreadMap = unreadData.reduce((acc, msg) => {
      acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
      return acc;
    }, {});

    // 4️⃣ Online státusz meghatározása last_seen alapján
    const now = new Date();
    const enrichedUsers = userData.map((user) => {
      const lastSeen = new Date(user.last_seen);
      const isOnline = (now - lastSeen) / 1000 / 60 < 5;
      return {
        ...user,
        is_online: isOnline,
        unread_count: unreadMap[user.id] || 0
      };
    });

    setUsers(enrichedUsers);
  };

  useEffect(() => {
    fetchUsers();

    // Feliratkozás valós idejű frissítésre
    const usersSub = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();

    const messagesSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUsers)
      .subscribe();

    // last_seen frissítése minden 60 mp-ben
    const interval = setInterval(() => {
      supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id)
        .then();
    }, 60000);

    // Cleanup
    return () => {
      supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id)
        .then();
      clearInterval(interval);
      usersSub.unsubscribe();
      messagesSub.unsubscribe();
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
            <span className="user-name">
              {user.username} {user.is_online ? '(Online)' : '(Offline)'}
              {user.unread_count > 0 && (
                <span className="unread-badge">{user.unread_count}</span>
              )}
            </span>
          </li>
        ))
      ) : (
        <li>Nincsenek elérhető felhasználók</li>
      )}
    </ul>
  </div>
);

}
