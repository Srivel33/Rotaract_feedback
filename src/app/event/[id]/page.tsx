"use client";

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './event.module.css';

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

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] ? prev[questionId].split(',') : [];
      if (checked) {
        return { ...prev, [questionId]: [...current, value].join(',') };
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value).join(',') };
      }
    });
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
              <label className={styles.questionLabel}>
                {index + 1}. {q.text} {q.isRequired && <span style={{color: '#ff4d4f'}}>*</span>}
              </label>
              
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

              {q.type === 'EMOJI' && q.options && (
                <div className={styles.emojiContainer}>
                  {JSON.parse(q.options).map((opt: string, i: number) => {
                    const emojiIcon = opt.split(' ')[0]; // E.g., extracts "🤩" from "🤩 Excellent"
                    return (
                      <button
                        type="button"
                        key={i}
                        className={`${styles.emojiOption} ${answers[q.id] === opt ? styles.selected : ''}`}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        title={opt}
                      >
                        {emojiIcon}
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'RADIO' && q.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                  {JSON.parse(q.options).map((opt: string, i: number) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', cursor: 'pointer', fontSize: '1rem' }}>
                      <input 
                        type="radio" 
                        name={`q_${q.id}`} 
                        value={opt} 
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-ocean-blue-light)' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'CHECKBOX' && q.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                  {JSON.parse(q.options).map((opt: string, i: number) => {
                    const isChecked = (answers[q.id] || '').split(',').includes(opt);
                    return (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', cursor: 'pointer', fontSize: '1rem' }}>
                        <input 
                          type="checkbox" 
                          value={opt} 
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(q.id, e.target.value, e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-ocean-blue-light)' }}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === 'DROPDOWN' && q.options && (
                <select 
                  className={styles.input} 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <option value="" disabled>Select an option</option>
                  {JSON.parse(q.options).map((opt: string, i: number) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === 'TEXT' && (
                <textarea 
                  className={styles.textarea}
                  placeholder="Write your comments here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={loading || eventData.questions.some((q: any) => q.isRequired && (!answers[q.id] || answers[q.id] === ''))}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>

        </form>
      </div>
    </main>
  );
}
