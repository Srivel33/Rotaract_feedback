"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

// Mock data until we connect to the database API
const MOCK_EVENTS = [
  {
    id: "evt_1",
    title: "Youth Leadership Summit 2024",
    location: "Chennai",
    date: "25 May 2024",
    isCompleted: false,
  },
  {
    id: "evt_2",
    title: "Community Service Drive",
    location: "Coimbatore",
    date: "18 May 2024",
    isCompleted: false,
  },
  {
    id: "evt_3",
    title: "Rotaract Training Program",
    location: "Madurai",
    date: "10 May 2024",
    isCompleted: true,
  }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  // Filter events based on active tab
  const displayedEvents = MOCK_EVENTS.filter(event => 
    activeTab === 'PENDING' ? !event.isCompleted : event.isCompleted
  );

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
                <span className={styles.metaItem}>📅 {event.date}</span>
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
