"use client";

import { useState, useEffect } from 'react';
import styles from './admin-dashboard.module.css';

type Tab = 'ALLOWLIST' | 'EVENTS' | 'RESPONSES';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ALLOWLIST');
  const [newEmail, setNewEmail] = useState('');
  const [allowedEmails, setAllowedEmails] = useState<{id: string, email: string, createdAt: string}[]>([]);

  // Events State
  const [events, setEvents] = useState<any[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  
  // Edit State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<any>({});

  useEffect(() => {
    if (activeTab === 'ALLOWLIST') {
      fetch('/api/admin/allowlist')
        .then(res => res.json())
        .then(data => {
          if (data.emails) setAllowedEmails(data.emails);
        });
    } else if (activeTab === 'EVENTS') {
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
    } catch (err) {
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
    } catch (err) {
      alert("Failed to remove email.");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newEventTitle, location: newEventLocation, date: newEventDate })
      });
      const data = await res.json();
      if (res.ok) {
        setEvents([data.event, ...events]);
        setNewEventTitle(''); setNewEventLocation(''); setNewEventDate('');
      } else alert(data.error);
    } catch (err) { alert("Failed to create event"); }
  };

  const handleToggleLock = async (event: any) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, isLocked: !event.isLocked })
      });
      if (res.ok) {
        setEvents(events.map(e => e.id === event.id ? { ...e, isLocked: !event.isLocked } : e));
      }
    } catch (err) { alert("Failed to update status"); }
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
    } catch (err) { alert("Error saving edits"); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event? (History is preserved)")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) { alert("Failed to delete"); }
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
            
            {/* Create Event Form */}
            <div className={styles.card}>
              <h3>Create New Event</h3>
              <form onSubmit={handleCreateEvent} className={styles.formGroup} style={{ flexWrap: 'wrap' }}>
                <input type="text" className={styles.input} placeholder="Event Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required />
                <input type="text" className={styles.input} placeholder="Location" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} required />
                <input type="date" className={styles.input} value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  + Create Event
                </button>
              </form>
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
                          <td><input className={styles.input} type="date" value={new Date(editEventData.date).toISOString().split('T')[0]} onChange={e => setEditEventData({...editEventData, date: e.target.value})} style={{padding: '5px', width: '100%'}}/></td>
                          <td>-</td>
                          <td>
                            <button onClick={handleSaveEdit} style={{color: '#10b981', marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer'}}>💾 Save</button>
                            <button onClick={() => setEditingEventId(null)} style={{color: '#aaa', background: 'transparent', border: 'none', cursor: 'pointer'}}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{event.title}</td>
                          <td>{new Date(event.date).toLocaleDateString()}</td>
                          <td style={{color: event.isLocked ? '#ff4d4f' : '#48cae4'}}>
                            {event.isLocked ? 'Locked' : 'Active'}
                          </td>
                          <td>
                            <button onClick={() => { setEditingEventId(event.id); setEditEventData(event); }} style={{marginRight: '1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer'}}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleToggleLock(event)} style={{marginRight: '1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer'}}>
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
