"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './event-details.module.css';

export default function AdminEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [eventData, setEventData] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/event/${resolvedParams.id}`).then(res => res.json()),
      fetch(`/api/admin/responses?eventId=${resolvedParams.id}`).then(res => res.json())
    ]).then(([eventRes, responsesRes]) => {
      if (eventRes.event) setEventData(eventRes.event);
      if (responsesRes.responses) setResponses(responsesRes.responses);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const handleExport = () => {
    if (responses.length === 0) {
      alert("No responses to export.");
      return;
    }

    const headers = ["Date", "Member Name", "Member Email", "Role", "Question", "Answer"];
    const rows: string[] = [];
    rows.push(headers.join(","));

    responses.forEach(res => {
      const date = new Date(res.createdAt).toLocaleDateString();
      const name = `"${res.user.name}"`;
      const email = `"${res.user.email}"`;
      const role = `"${res.user.role}"`;

      res.answers.forEach((ans: any) => {
        const questionText = `"${ans.question.text}"`;
        const answerText = `"${ans.value.replace(/"/g, '""')}"`;
        rows.push([date, name, email, role, questionText, answerText].join(","));
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${eventData.title.replace(/\s+/g, '_')}_Feedback.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Loading Event Data...</div>;
  if (!eventData) return <div style={{ color: 'red', padding: '3rem', textAlign: 'center' }}>Event not found</div>;

  // VISUALIZATION LOGIC
  // Calculate Average Rating if a RATING question exists
  const ratingQuestion = eventData.questions.find((q: any) => q.type === 'RATING');
  let avgRating = 0;
  if (ratingQuestion) {
    const ratings = responses.flatMap(r => r.answers.filter((a: any) => a.questionId === ratingQuestion.id).map((a: any) => parseInt(a.value)));
    if (ratings.length > 0) avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  // Calculate Emoji Breakdown if EMOJI question exists
  const emojiQuestion = eventData.questions.find((q: any) => q.type === 'EMOJI');
  const emojiCounts: Record<string, number> = {};
  if (emojiQuestion) {
    responses.forEach(r => {
      const ans = r.answers.find((a: any) => a.questionId === emojiQuestion.id);
      if (ans) emojiCounts[ans.value] = (emojiCounts[ans.value] || 0) + 1;
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ flex: 1 }}>
          <h1>{eventData.title}</h1>
          <p>{new Date(eventData.date).toLocaleDateString()} • {eventData.location}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleExport} className="btn-primary" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', fontSize: '0.9rem' }}>
            📥 Export CSV
          </button>
          <Link href="/admin/dashboard">
            <button style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        
        {/* STATS VISUALIZATION */}
        <div className={styles.statsCard}>
          <h3>Event Overview</h3>
          <div className={styles.statBox}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-ocean-blue-light)' }}>{responses.length}</span>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Total Responses</span>
          </div>

          {ratingQuestion && (
            <div className={styles.statBox} style={{ marginTop: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>
                {avgRating.toFixed(1)} ★
              </span>
              <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Average Rating</span>
              <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', width: '100%', marginTop: '10px' }}>
                <div style={{ background: '#eab308', height: '100%', borderRadius: '4px', width: `${(avgRating / 5) * 100}%` }}></div>
              </div>
            </div>
          )}

          {emojiQuestion && Object.keys(emojiCounts).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#aaa', marginBottom: '1rem' }}>Sentiment Breakdown</h4>
              {Object.entries(emojiCounts).map(([emoji, count]) => (
                <div key={emoji} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px' }}>
                    <div style={{ background: 'var(--color-ocean-blue-light)', height: '100%', borderRadius: '6px', width: `${(count / responses.length) * 100}%` }}></div>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#fff', width: '30px', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LINEAR RESPONSES FEED */}
        <div className={styles.feedCard}>
          <h3>Detailed Feedback Feed</h3>
          
          {responses.length === 0 ? (
            <p style={{ color: '#aaa', fontStyle: 'italic', marginTop: '1rem' }}>No feedback submitted yet.</p>
          ) : (
            <div className={styles.feedList}>
              {responses.map((res: any) => (
                <div key={res.id} className={styles.feedItem}>
                  <div className={styles.feedHeader}>
                    <div>
                      <strong>{res.user.name}</strong> <span style={{ color: '#888', fontSize: '0.8rem' }}>({res.user.role})</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {new Date(res.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className={styles.feedAnswers}>
                    {res.answers.map((ans: any) => (
                      <div key={ans.id} className={styles.answerBlock}>
                        <div className={styles.answerQuestion}>{ans.question.text}</div>
                        <div className={styles.answerValue}>
                          {ans.question.type === 'RATING' ? `${ans.value} ★` : ans.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
