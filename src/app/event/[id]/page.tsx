"use client";

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './event.module.css';

// Mock event details until backend is hooked up
const MOCK_EVENT = {
  title: "Youth Leadership Summit 2024",
  date: "25 May 2024"
};

const EMOJIS = [
  { id: 'excellent', icon: '🤩', label: 'Excellent' },
  { id: 'good', icon: '🙂', label: 'Good' },
  { id: 'average', icon: '😐', label: 'Average' },
  { id: 'poor', icon: '☹️', label: 'Poor' }
];

export default function EventFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [emoji, setEmoji] = useState('');
  const [feedback, setFeedback] = useState('');
  const [eventData, setEventData] = useState<{title: string, date: string} | null>(null);

  useEffect(() => {
    // Optionally fetch actual event details here if needed.
    // For now we will just use a generic title or pass it down.
    setEventData({ title: "Feedback Form", date: new Date().toLocaleDateString() });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert("Please log in first!");
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch(`/api/event/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, rating, emoji, feedback })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      alert("Feedback submitted successfully! Thank you.");
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        
        <div className={styles.header}>
          <h1>{eventData?.title || "Loading..."}</h1>
          <p>{eventData?.date || ""} — Share your voice!</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Star Rating Section */}
          <div className={styles.questionSection}>
            <label className={styles.questionLabel}>1. How was your overall experience?</label>
            <div className={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  className={`${styles.star} ${star <= rating ? styles.active : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Emoji Rating Section */}
          <div className={styles.questionSection}>
            <label className={styles.questionLabel}>2. How would you rate the organization?</label>
            <div className={styles.emojiContainer}>
              {EMOJIS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`${styles.emojiOption} ${emoji === item.id ? styles.selected : ''}`}
                  onClick={() => setEmoji(item.id)}
                  title={item.label}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Long Text Section */}
          <div className={styles.questionSection}>
            <label className={styles.questionLabel}>3. Any highlights or suggestions?</label>
            <textarea 
              className={styles.textarea}
              placeholder="Write your comments here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || rating === 0 || emoji === ''}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

        </form>
      </div>
    </main>
  );
}
