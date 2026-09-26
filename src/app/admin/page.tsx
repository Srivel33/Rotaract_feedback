"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log("Attempting Admin Login:", { email, password });
      
      // We will replace this with a real backend API call
      alert("Admin UI Built! Ready to connect to backend authentication.");
      
      // router.push('/admin/dashboard');
    } catch (err) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.adminContainer}>
      <div className={styles.loginCard}>
        
        <div className={styles.header}>
          <h1>Command Center</h1>
          <p>Restricted Admin Access</p>
        </div>

        {error && <div style={{color: '#ff4d4f', textAlign: 'center', fontSize: '0.9rem'}}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Admin Email</label>
            <input 
              type="email" 
              id="email"
              className={styles.input} 
              placeholder="admin@rotaract.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              type="password" 
              id="password"
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>

        </form>
      </div>
    </main>
  );
}
