"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './admin-dashboard.module.css';

type Tab = 'ALLOWLIST' | 'EVENTS' | 'RESPONSES';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ALLOWLIST');
  const [newEmail, setNewEmail] = useState('');
  const [allowedEmails, setAllowedEmails] = useState<{id: string, email: string, createdAt: string}[]>([]);

  const router = useRouter();

  // Events State
  const [events, setEvents] = useState<{id: string; title: string; location: string; date: string; isLocked: boolean; _count?: { responses: number }}[]>([]);
  // Edit State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<Partial<{id: string; title: string; location: string; date: string; isLocked: boolean; isArchived: boolean}>>({});

  useEffect(() => {
    if (activeTab === 'ALLOWLIST') {
      fetch('/api/admin/allowlist')
        .then(res => res.json())
        .then(data => {
          if (data.emails) setAllowedEmails(data.emails);
        });
    } else if (activeTab === 'EVENTS' || activeTab === 'RESPONSES') {
      fetch('/api/admin/events')
        .then(res => res.json())
        .then(data => {
          if (data.events) setEvents(data.events);
        });
    }
  }, [activeTab]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setAllowedEmails([data.newEmail, ...allowedEmails]);
        setNewEmail('');
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to add email.");
    }
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/allowlist?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllowedEmails(allowedEmails.filter(e => e.email !== email));
      }
    } catch {
      alert("Failed to remove email.");
    }
  };

  const handleToggleLock = async (event: {id: string; isLocked: boolean}) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, isLocked: !event.isLocked })
      });
      if (res.ok) {
        setEvents(events.map(e => e.id === event.id ? { ...e, isLocked: !event.isLocked } : e));
      }
    } catch { alert("Failed to update status"); }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEventData)
      });
      if (res.ok) {
        setEvents(events.map(e => e.id === editEventData.id ? { ...e, ...editEventData } : e));
        setEditingEventId(null);
      } else {
        alert("Failed to save edits.");
      }
    } catch { alert("Error saving edits"); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event completely? This action cannot be undone and will delete all associated feedback.")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch { alert("Failed to delete"); }
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
              <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.9rem' }}>
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
                  {allowedEmails.map(item => (
                    <tr key={item.id}>
                      <td>{item.email}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleRemoveEmail(item.email)}
                          style={{color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer'}}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allowedEmails.length === 0 && (
                    <tr><td colSpan={3} style={{textAlign: 'center'}}>No authorized emails yet.</td></tr>
                  )}
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
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Manage Events & Forms</h2>
              <button 
                className="btn-primary" 
                onClick={() => router.push('/admin/events/create')}
                style={{ padding: '10px 20px', fontSize: '1rem', fontWeight: 'bold' }}
              >
                + Create New Event & Form
              </button>
            </div>

            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      {editingEventId === event.id ? (
                        <>
                          <td><input className={styles.input} type="text" value={editEventData.title} onChange={e => setEditEventData({...editEventData, title: e.target.value})} style={{padding: '5px', width: '100%'}}/></td>
                          <td><input className={styles.input} type="date" value={editEventData.date ? new Date(editEventData.date).toISOString().split('T')[0] : ''} onChange={e => setEditEventData({...editEventData, date: e.target.value})} style={{padding: '5px', width: '100%'}}/></td>
                          <td>-</td>
                          <td>
                            <button onClick={handleSaveEdit} style={{color: '#10b981', marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer'}}>💾 Save</button>
                            <button onClick={() => setEditingEventId(null)} style={{color: '#555', background: 'transparent', border: 'none', cursor: 'pointer'}}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <Link href={`/admin/event/${event.id}`} style={{ color: 'var(--color-ocean-blue-light)', textDecoration: 'none', fontWeight: 'bold' }}>
                              {event.title} ↗
                            </Link>
                          </td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td style={{color: event.isLocked ? '#ff4d4f' : '#48cae4'}}>
                            {event.isLocked ? 'Locked' : 'Active'}
                          </td>
                          <td>
                            <button onClick={() => { setEditingEventId(event.id); setEditEventData(event); }} style={{marginRight: '1rem', background: 'transparent', border: 'none', color: '#333', cursor: 'pointer'}}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleToggleLock(event)} style={{marginRight: '1rem', background: 'transparent', border: 'none', color: '#333', cursor: 'pointer'}}>
                              {event.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)} style={{color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer'}}>
                              🗑️ Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {events.length === 0 && <tr><td colSpan={4} style={{textAlign: 'center'}}>No events created yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RESPONSES TAB */}
        {activeTab === 'RESPONSES' && (
          <section>
            <div className={styles.sectionHeader}>
              <h1>Event Analytics & Feedback</h1>
              <p style={{ color: '#555', marginTop: '0.5rem' }}>Select an event to view detailed feedback, visualizations, and export specific CSV data.</p>
            </div>
            
            <div className={styles.card}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Total Responses</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ 
                          background: 'rgba(72, 202, 228, 0.1)', 
                          color: 'var(--color-ocean-blue-light)', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontWeight: 'bold' 
                        }}>
                          {event._count?.responses || 0}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/event/${event.id}`}>
                          <button style={{ 
                            background: 'var(--color-ocean-blue)', 
                            color: '#333', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}>
                            View Analytics ↗
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && <tr><td colSpan={4} style={{textAlign: 'center'}}>No active events found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
