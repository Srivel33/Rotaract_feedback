"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', role: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success! In a real app we'd redirect to dashboard here.
      alert(`Success! Welcome ${data.user.name}. You are now allowed into the dashboard.`);
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.authContainer}>
      <div className={`glass-card ${styles.formCard}`}>
        <div className={styles.header}>
          <h1>Who's making waves?</h1>
          <p>Enter your details to access the ORCA dashboard.</p>
        </div>

        {error && <div style={{color: 'red', textAlign: 'center', fontSize: '0.9rem'}}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              className={styles.input} 
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>Club Role</label>
            <input 
              type="text" 
              id="role"
              name="role"
              className={styles.input} 
              placeholder="e.g. Member, Secretary"
              value={formData.role}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email"
              name="email"
              className={styles.input} 
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Checking..." : "Dive In"}
          </button>

        </form>
      </div>
    </main>
  );
}
