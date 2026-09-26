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

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'RATING': return '★ RATING';
      case 'EMOJI': return '😀 EMOJI';
      case 'TEXT': return '📝 TEXT';
      case 'RADIO': return '🔘 RADIO';
      case 'CHECKBOX': return '☑️ CHECKBOX';
      case 'DROPDOWN': return '▼ DROPDOWN';
      default: return type;
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
          </div>

          {newQuestions.map((q, index) => {
            return (
              <div key={q.id} className={styles.questionItem}>
                <div className={styles.questionHeader}>
                  <div className={styles.typeBadge}>
                    {getBadgeIcon(q.type)}
                  </div>
                </div>
                
                <input 
                  type="text" 
                  className={styles.questionInput} 
                  placeholder="Question text..." 
                  value={q.text} 
                  onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                  required
                />

                {['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && (
                  <div>
                    <input 
                      type="text" 
                      className={styles.optionsInput} 
                      placeholder="Enter options separated by commas (e.g. Yes, No, Maybe)" 
                      value={q.options || ''} 
                      onChange={(e) => handleUpdateQuestion(q.id, 'options', e.target.value)} 
                      required
                    />
                  </div>
                )}

                <div className={styles.questionFooter}>
                  <label className={styles.requiredToggle}>
                    <input 
                      type="checkbox" 
                      checked={q.isRequired} 
                      onChange={(e) => handleUpdateQuestion(q.id, 'isRequired', e.target.checked)} 
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-ocean-blue-light)' }}
                    /> 
                    Required
                  </label>
                  
                  <button type="button" className={styles.toolbarBtn} onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0} title="Move Up">⬆️</button>
                  <button type="button" className={styles.toolbarBtn} onClick={() => handleMoveQuestion(index, 'down')} disabled={index === newQuestions.length - 1} title="Move Down">⬇️</button>
                  <button type="button" className={`${styles.toolbarBtn} ${styles.deleteBtn}`} onClick={() => handleRemoveQuestion(q.id)} title="Delete Question">🗑️</button>
                </div>
              </div>
            );
          })}

          <div className={styles.addMenu}>
            <div className={styles.addMenuTitle}>+ Add new element</div>
            <div className={styles.addGrid}>
              <button type="button" onClick={() => handleAddQuestion('RATING')} className={styles.addIconBtn}>★ Star Rating</button>
              <button type="button" onClick={() => handleAddQuestion('EMOJI')} className={styles.addIconBtn}>😀 Emoji Reaction</button>
              <button type="button" onClick={() => handleAddQuestion('TEXT')} className={styles.addIconBtn}>📝 Long Text</button>
              <button type="button" onClick={() => handleAddQuestion('RADIO')} className={styles.addIconBtn}>🔘 Multiple Choice</button>
              <button type="button" onClick={() => handleAddQuestion('CHECKBOX')} className={styles.addIconBtn}>☑️ Checkboxes</button>
              <button type="button" onClick={() => handleAddQuestion('DROPDOWN')} className={styles.addIconBtn}>▼ Dropdown</button>
            </div>
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
