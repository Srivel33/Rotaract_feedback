"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create-event.module.css';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newQuestions, setNewQuestions] = useState<{id: number, type: string, text: string, options?: string, isRequired: boolean}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = (type: string) => {
    setNewQuestions([...newQuestions, { id: Date.now(), type, text: '', options: '', isRequired: true }]);
  };

  const handleUpdateQuestion = (id: number, field: string, value: any) => {
    setNewQuestions(newQuestions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleRemoveQuestion = (id: number) => {
    setNewQuestions(newQuestions.filter(q => q.id !== id));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQs = [...newQuestions];
    if (direction === 'up' && index > 0) {
      [newQs[index - 1], newQs[index]] = [newQs[index], newQs[index - 1]];
    } else if (direction === 'down' && index < newQs.length - 1) {
      [newQs[index + 1], newQs[index]] = [newQs[index], newQs[index + 1]];
    }
    setNewQuestions(newQs);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestions.length === 0) {
      alert("Please add at least one question to your form.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newEventTitle, 
          location: newEventLocation, 
          date: newEventDate,
          questions: newQuestions 
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Event and Form Published Successfully!");
        router.push('/admin/dashboard');
      } else {
        alert(data.error);
        setLoading(false);
      }
    } catch (err) { 
      alert("Failed to create event");
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'RATING': return { bg: '#3b82f6', color: '#fff' };
      case 'EMOJI': return { bg: '#eab308', color: '#000' };
      case 'TEXT': return { bg: '#8b5cf6', color: '#fff' };
      case 'RADIO': return { bg: '#ec4899', color: '#fff' };
      case 'CHECKBOX': return { bg: '#10b981', color: '#fff' };
      case 'DROPDOWN': return { bg: '#6366f1', color: '#fff' };
      default: return { bg: '#555', color: '#fff' };
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.builderHeader}>
        <h1>Form Builder</h1>
        <Link href="/admin/dashboard">
          <button>← Back to Dashboard</button>
        </Link>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handlePublish}>
          
          <div className={styles.eventDetailsRow}>
            <div className={styles.inputGroup}>
              <label>Event Title</label>
              <input type="text" className={styles.input} placeholder="Youth Leadership Summit" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Location</label>
              <input type="text" className={styles.input} placeholder="SNSCT Campus" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Date</label>
              <input type="date" className={styles.input} value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className={styles.questionsHeader}>
            <h2>Form Questions</h2>
            <span style={{color: '#888', fontSize: '0.9rem'}}>{newQuestions.length} Questions Added</span>
          </div>

          {newQuestions.map((q, index) => {
            const badgeStyle = getBadgeColor(q.type);
            return (
              <div key={q.id} className={styles.questionItem}>
                <div className={styles.questionRow}>
                  <div className={styles.typeBadge} style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                    {q.type}
                  </div>
                  
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Enter your question prompt here..." 
                    value={q.text} 
                    onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                    style={{ flex: 1 }}
                    required
                  />

                  <div className={styles.questionTools}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer', marginRight: '10px' }}>
                      <input type="checkbox" checked={q.isRequired} onChange={(e) => handleUpdateQuestion(q.id, 'isRequired', e.target.checked)} style={{accentColor: 'var(--color-ocean-blue-light)'}}/> Required
                    </label>
                    
                    <button type="button" className={styles.iconBtn} onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0} style={{ color: index === 0 ? '#444' : '#fff' }}>⬆️</button>
                    <button type="button" className={styles.iconBtn} onClick={() => handleMoveQuestion(index, 'down')} disabled={index === newQuestions.length - 1} style={{ color: index === newQuestions.length - 1 ? '#444' : '#fff' }}>⬇️</button>
                    <button type="button" className={styles.iconBtn} onClick={() => handleRemoveQuestion(q.id)} style={{ color: '#ff4d4f', marginLeft: '5px' }}>✕</button>
                  </div>
                </div>

                {['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && (
                  <div style={{ paddingLeft: '116px', marginTop: '10px' }}>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Comma-separated options (e.g. Yes, No, Maybe)" 
                      value={q.options || ''} 
                      onChange={(e) => handleUpdateQuestion(q.id, 'options', e.target.value)} 
                      style={{ width: '100%', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)' }}
                      required
                    />
                  </div>
                )}
              </div>
            );
          })}

          {newQuestions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', margin: '2rem 0' }}>
              No questions added yet. Start building your custom form below.
            </p>
          )}

          <div className={styles.addButtons}>
            <button type="button" onClick={() => handleAddQuestion('RATING')} className={styles.addBtn} style={{ background: '#3b82f6', color: '#fff' }}>+ Star Rating</button>
            <button type="button" onClick={() => handleAddQuestion('EMOJI')} className={styles.addBtn} style={{ background: '#eab308', color: '#000' }}>+ Emoji Reaction</button>
            <button type="button" onClick={() => handleAddQuestion('TEXT')} className={styles.addBtn} style={{ background: '#8b5cf6', color: '#fff' }}>+ Long Text</button>
            <button type="button" onClick={() => handleAddQuestion('RADIO')} className={styles.addBtn} style={{ background: '#ec4899', color: '#fff' }}>+ Multiple Choice</button>
            <button type="button" onClick={() => handleAddQuestion('CHECKBOX')} className={styles.addBtn} style={{ background: '#10b981', color: '#fff' }}>+ Checkboxes</button>
            <button type="button" onClick={() => handleAddQuestion('DROPDOWN')} className={styles.addBtn} style={{ background: '#6366f1', color: '#fff' }}>+ Dropdown</button>
          </div>

          <div className={styles.submitSection}>
            <button type="submit" className={styles.publishBtn} disabled={loading}>
              {loading ? "Publishing..." : "🚀 Publish Event & Form"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
