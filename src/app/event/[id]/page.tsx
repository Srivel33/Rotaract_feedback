"use client";

import { useState } from 'react';
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

export default function EventFeedbackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [emoji, setEmoji] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Submitting Feedback:", {
        eventId: params.id,
        rating,
        emoji,
        feedback
      });

      alert("Feedback submitted successfully! Thank you.");
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        
        <div className={styles.header}>
          <h1>{MOCK_EVENT.title}</h1>
          <p>{MOCK_EVENT.date} — Share your voice!</p>
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
