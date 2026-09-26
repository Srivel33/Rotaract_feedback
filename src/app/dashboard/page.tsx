"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [events, setEvents] = useState<{id: string; title: string; location: string; date: string; isCompleted: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth');
      return;
    }

    fetch(`/api/user/events?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          setEvents(data.events);
        } else {
          setError(data.error || 'Failed to load events');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('An error occurred while fetching events');
        setLoading(false);
      });
  }, []);

  // Filter events based on active tab
  const displayedEvents = events.filter(event => 
    activeTab === 'PENDING' ? !event.isCompleted : event.isCompleted
  );

  if (loading) {
    return <main className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><h2>Loading...</h2></main>;
  }

  if (error) {
    return <main className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><h2>{error}</h2></main>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome Back</h1>
        <p>Your voice creates our next ripple.</p>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'PENDING' ? styles.active : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Feedback
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'COMPLETED' ? styles.active : ''}`}
          onClick={() => setActiveTab('COMPLETED')}
        >
          Completed Events
        </button>
      </div>

      <div className={styles.eventGrid}>
        {displayedEvents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>
            No events found in this section.
          </p>
        ) : (
          displayedEvents.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <h2 className={styles.eventTitle}>{event.title}</h2>
              <div className={styles.eventMeta}>
                <span className={styles.metaItem}>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span className={styles.metaItem}>📍 {event.location}</span>
              </div>
              
              {event.isCompleted ? (
                <div className={styles.completedBadge}>
                  ✓ Feedback Submitted
                </div>
              ) : (
                <Link href={`/event/${event.id}`} className={`btn-primary ${styles.feedbackBtn}`}>
                  Give Feedback
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
