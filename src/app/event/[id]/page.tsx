"use client";

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './event.module.css';

const EMOJIS = [
  { id: '🤩', label: 'Excellent' },
  { id: '🙂', label: 'Good' },
  { id: '😐', label: 'Average' },
  { id: '☹️', label: 'Poor' }
];

export default function EventFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [eventData, setEventData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/event/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.event) {
          setEventData(data.event);
        } else {
          setError(data.error || "Event not found");
        }
      })
      .catch(() => setError("Failed to load event data."));
  }, [resolvedParams.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert("Please log in first!");
      router.push('/auth');
      return;
    }

    const answersArray = Object.keys(answers).map(qId => ({
      questionId: qId,
      value: answers[qId]
    }));

    try {
      const response = await fetch(`/api/event/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, answers: answersArray })
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

  if (error) {
    return <main className={styles.container}><div style={{ color: 'red', marginTop: '5rem' }}>{error}</div></main>;
  }

  if (!eventData) {
    return <main className={styles.container}><div style={{ color: 'white', marginTop: '5rem' }}>Loading Form...</div></main>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.formWrapper}>
        
        <div className={styles.header}>
          <h1>{eventData.title}</h1>
          <p>{new Date(eventData.date).toLocaleDateString()} — Share your voice!</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {eventData.questions.map((q: any, index: number) => (
            <div key={q.id} className={styles.questionSection}>
              <label className={styles.questionLabel}>{index + 1}. {q.text}</label>
              
              {q.type === 'RATING' && (
                <div className={styles.starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      className={`${styles.star} ${parseInt(answers[q.id] || "0") >= star ? styles.active : ''}`}
                      onClick={() => handleAnswerChange(q.id, star.toString())}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              {q.type === 'EMOJI' && (
                <div className={styles.emojiContainer}>
                  {EMOJIS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`${styles.emojiOption} ${answers[q.id] === item.id ? styles.selected : ''}`}
                      onClick={() => handleAnswerChange(q.id, item.id)}
                      title={item.label}
                    >
                      {item.id}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'TEXT' && (
                <textarea 
                  className={styles.textarea}
                  placeholder="Write your comments here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  required
                />
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || Object.keys(answers).length < eventData.questions.length}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

        </form>
      </div>
    </main>
  );
}
