"use client";

import { useState, useEffect, use, useRef } from 'react';

import Link from 'next/link';
import styles from './event-details.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EventData {
  id: string; title: string; location: string; date: string;
  questions: {id: string; type: string; text: string; options?: string}[];
}

interface ResponseData {
  id: string; createdAt: string;
  user: { name: string; email: string; role: string; };
  answers: { id: string; questionId: string; value: string; question: {text: string; type: string} }[];
}

export default function AdminEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'respondent' | 'question'>('respondent');
  const dashboardRef = useRef<HTMLDivElement>(null);

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
    if (!eventData || responses.length === 0) {
      alert("No responses or event data to export.");
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

      res.answers.forEach((ans) => {
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

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${eventData?.title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  if (loading) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Loading Event Data...</div>;
  if (!eventData) return <div style={{ color: 'red', padding: '3rem', textAlign: 'center' }}>Event not found</div>;

  // VISUALIZATION LOGIC
  // Calculate Average Rating if a RATING question exists
  const ratingQuestion = eventData?.questions.find((q) => q.type === 'RATING');
  let avgRating = 0;
  if (ratingQuestion) {
    const ratings = responses.flatMap(r => r.answers.filter((a) => a.questionId === ratingQuestion.id).map((a) => parseInt(a.value)));
    if (ratings.length > 0) avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  // Calculate Emoji Breakdown if EMOJI question exists
  const emojiQuestion = eventData?.questions.find((q) => q.type === 'EMOJI');
  const emojiCounts: Record<string, number> = {};
  if (emojiQuestion) {
    responses.forEach(r => {
      const ans = r.answers.find((a) => a.questionId === emojiQuestion.id);
      if (ans) emojiCounts[ans.value] = (emojiCounts[ans.value] || 0) + 1;
    });
  }

  // Calculate Choice Breakdowns for RADIO, CHECKBOX, DROPDOWN
  const choiceQuestions = eventData?.questions.filter(q => ['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type)) || [];
  const choiceStats: Record<string, Record<string, number>> = {};
  
  choiceQuestions.forEach(q => {
    choiceStats[q.id] = {};
    const options = JSON.parse(q.options || "[]") as string[];
    options.forEach(opt => choiceStats[q.id][opt] = 0);

    responses.forEach(r => {
      const ans = r.answers.find(a => a.questionId === q.id);
      if (ans) {
        if (q.type === 'CHECKBOX') {
          const selected = ans.value.split(',');
          selected.forEach(s => {
            if (choiceStats[q.id][s] !== undefined) choiceStats[q.id][s]++;
          });
        } else {
          if (choiceStats[q.id][ans.value] !== undefined) choiceStats[q.id][ans.value]++;
        }
      }
    });
  });

  const COLORS = ['#0077b6', '#48cae4', '#90e0ef', '#00b4d8', '#03045e', '#023e8a'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ flex: 1 }}>
          <h1>{eventData.title}</h1>
          <p>{new Date(eventData.date).toLocaleDateString()} • {eventData.location}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleDownloadPDF} className="btn-primary" style={{ background: '#ef4444', color: '#fff', padding: '10px 20px', fontSize: '0.9rem' }}>
            📄 Download PDF
          </button>
          <button onClick={handleExport} className="btn-primary" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', fontSize: '0.9rem' }}>
            📥 Export CSV
          </button>
          <Link href="/admin/dashboard">
            <button style={{ background: 'transparent', border: '1px solid #ccc', color: '#555', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid} ref={dashboardRef}>
        
        {/* STATS VISUALIZATION */}
        <div className={styles.statsCard}>
          <h3>Event Overview</h3>
          <div className={styles.statBox}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-ocean-blue-light)' }}>{responses.length}</span>
            <span style={{ color: '#555', fontSize: '0.9rem' }}>Total Responses</span>
          </div>

          {ratingQuestion && (
            <div className={styles.statBox} style={{ marginTop: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>
                {avgRating.toFixed(1)} ★
              </span>
              <span style={{ color: '#555', fontSize: '0.9rem' }}>Average Rating</span>
              <div style={{ background: 'rgba(0,0,0,0.1)', height: '8px', borderRadius: '4px', width: '100%', marginTop: '10px' }}>
                <div style={{ background: '#eab308', height: '100%', borderRadius: '4px', width: `${(avgRating / 5) * 100}%` }}></div>
              </div>
            </div>
          )}

          {emojiQuestion && Object.keys(emojiCounts).length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#555', marginBottom: '1rem' }}>Sentiment Breakdown</h4>
              <div style={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(emojiCounts).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.keys(emojiCounts).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {choiceQuestions.map(q => {
            const stats = choiceStats[q.id];
            const data = Object.entries(stats).map(([name, value]) => ({ name, value }));
            return (
              <div key={q.id} style={{ marginTop: '2rem' }}>
                <h4 style={{ color: '#555', marginBottom: '1rem', fontSize: '1rem' }}>{q.text}</h4>
                <div style={{ height: 250, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="var(--color-ocean-blue)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* FEED SECTION */}
        <div className={styles.feedCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Detailed Feedback Feed</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
              <button 
                onClick={() => setViewMode('respondent')}
                style={{ 
                  background: viewMode === 'respondent' ? 'var(--color-ocean-blue)' : 'transparent', 
                  color: viewMode === 'respondent' ? '#333' : '#777', 
                  border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' 
                }}
              >
                By Respondent
              </button>
              <button 
                onClick={() => setViewMode('question')}
                style={{ 
                  background: viewMode === 'question' ? 'var(--color-ocean-blue)' : 'transparent', 
                  color: viewMode === 'question' ? '#333' : '#777', 
                  border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' 
                }}
              >
                By Question
              </button>
            </div>
          </div>
          
          {responses.length === 0 ? (
            <p style={{ color: '#555', fontStyle: 'italic', marginTop: '1rem' }}>No feedback submitted yet.</p>
          ) : viewMode === 'respondent' ? (
            <div className={styles.feedList}>
              {responses.map((res) => (
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
                    {res.answers.map((ans) => (
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
          ) : (
            <div className={styles.feedList}>
              {eventData?.questions.map((q) => {
                const questionAnswers = responses.map(res => {
                  const ans = res.answers.find((a) => a.questionId === q.id);
                  return ans ? { user: res.user, value: ans.value, date: res.createdAt } : null;
                }).filter(Boolean) as { user: { name: string; email: string; role: string; }; value: string; date: string }[];

                if (questionAnswers.length === 0) return null;

                return (
                  <div key={q.id} className={styles.feedItem} style={{ borderLeft: '4px solid var(--color-ocean-blue-light)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>{q.text}</h4>
                    <div className={styles.feedAnswers}>
                      {questionAnswers.map((qa: {user: {name: string}, value: string, date: string}, idx: number) => (
                        <div key={idx} className={styles.answerBlock} style={{ borderLeft: 'none', background: 'rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>{qa.user.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(qa.date).toLocaleDateString()}</span>
                          </div>
                          <div className={styles.answerValue}>
                            {q.type === 'RATING' ? `${qa.value} ★` : qa.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
