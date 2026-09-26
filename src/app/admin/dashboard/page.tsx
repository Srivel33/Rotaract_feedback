"use client";

import { useState } from 'react';
import styles from './admin-dashboard.module.css';

type Tab = 'ALLOWLIST' | 'EVENTS' | 'RESPONSES';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ALLOWLIST');
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Backend not connected yet. Would add: ${newEmail}`);
    setNewEmail('');
  };

  const handleExport = () => {
    alert("Exporting CSV...");
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>ORCA Admin</h2>
        </div>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navButton} ${activeTab === 'ALLOWLIST' ? styles.active : ''}`}
            onClick={() => setActiveTab('ALLOWLIST')}
          >
            👥 Manage Allowlist
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'EVENTS' ? styles.active : ''}`}
            onClick={() => setActiveTab('EVENTS')}
          >
            📅 Manage Events
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'RESPONSES' ? styles.active : ''}`}
            onClick={() => setActiveTab('RESPONSES')}
          >
            📊 View Responses
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* ALLOWLIST TAB */}
        {activeTab === 'ALLOWLIST' && (
          <section>
            <div className={styles.sectionHeader}>
              <h1>Member Allowlist</h1>
            </div>
            <div className={styles.card}>
              <h3>Authorize a New Member</h3>
              <p style={{ color: '#aaa', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Only emails added here can log into the participant portal.
              </p>
              <form onSubmit={handleAddEmail} className={styles.formGroup}>
                <input 
                  type="email" 
                  className={styles.input} 
                  placeholder="member@snsct.org" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  + Add Email
                </button>
              </form>
            </div>
            
            <div className={styles.card}>
              <h3>Authorized Emails</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Date Added</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock Data */}
                  <tr>
                    <td>srivel@gmail.com</td>
                    <td>Sept 26, 2026</td>
                    <td><button style={{color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer'}}>Remove</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'EVENTS' && (
          <section>
            <div className={styles.sectionHeader}>
              <h1>Manage Events</h1>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                + Create Event
              </button>
            </div>
            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Youth Leadership Summit</td>
                    <td>25 May 2024</td>
                    <td style={{color: '#48cae4'}}>Active</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RESPONSES TAB */}
        {activeTab === 'RESPONSES' && (
          <section>
            <div className={styles.sectionHeader}>
              <h1>Feedback Responses</h1>
              <button onClick={handleExport} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', background: '#10b981', color: '#fff' }}>
                📥 Export CSV
              </button>
            </div>
            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Role</th>
                    <th>Event</th>
                    <th>Rating</th>
                    <th>Emoji</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>Secretary</td>
                    <td>Youth Leadership Summit</td>
                    <td>5 ★</td>
                    <td>🤩</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
