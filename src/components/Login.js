import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) {
        setError(error.message);
      } else {
        if (data.user && !data.user.confirmed_at) {
          setMessage('Regisztráció sikeres! Kérlek, erősítsd meg az email címedet a folytatáshoz.');
        } else {
          setUser(data.user);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setError(error.message);
      } else if (data.user && !data.user.confirmed_at) {
        setError('Kérlek, először erősítsd meg az email címedet.');
      } else {
        setUser(data.user);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>{isSignUp ? 'Regisztráció' : 'Bejelentkezés'}</h2>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div>
            <label>Felhasználónév</label>
          <input
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>
          </div>
        )}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <button type="submit">{isSignUp ? 'Regisztráció' : 'Bejelentkezés'}</button>
        <p>
          {isSignUp ? 'Már van fiókod?' : 'Nincs fiókod?'}
          <span
            className="toggle-auth"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
          >
            {isSignUp ? ' Bejelentkezés' : ' Regisztráció'}
          </span>
        </p>
      </form>
    </div>
  );
}