import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Chat({ currentUser, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;

    // Üzenetek lekérése a jelenlegi és a kiválasztott felhasználó között
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, is_read')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),` +
          `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true });
      if (!error) {
        setMessages(data);
        // Olvasatlan üzenetek megjelölése olvasottként
        const unreadMessageIds = data
          .filter((msg) => msg.receiver_id === currentUser.id && !msg.is_read)
          .map((msg) => msg.id);
        if (unreadMessageIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessageIds);
        }
      }
    };

    fetchMessages();

    // Valós idejű üzenetekre való feliratkozás
    const subscription = supabase
      .channel(`messages:${currentUser.id}-${selectedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=in.(${currentUser.id},${selectedUser.id}),receiver_id=in.(${currentUser.id},${selectedUser.id})`
        },
        (payload) => {
          setMessages((prev) => {
            if (!prev.some((msg) => msg.id === payload.new.id)) {
              return [...prev, payload.new];
            }
            return prev;
          });
          // Ha az üzenet nekem érkezett, jelöljük olvasottként
          if (payload.new.receiver_id === currentUser.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: newMessage,
        is_read: false
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === data.id)) {
          return [...prev, data];
        }
        return prev;
      });
      setNewMessage('');
    }
  };

  // Magyar időformátum: Hónap nap. óra:perc
  const formatHungarianDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
      'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}. ${hours}:${minutes}`;
  };

  return (
    <div className="chat-container">
      {selectedUser ? (
        <>
          <h2>Csevegés {selectedUser.username} felhasználóval</h2>
          <div className="messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
              >
                <p>{msg.content}</p>
                <span>{formatHungarianDate(msg.created_at)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Üzenet írása..."
            />
            <button type="submit">Küldés</button>
          </form>
        </>
      ) : (
        <p>Válassz egy felhasználót a csevegéshez!</p>
      )}
    </div>
  );
}