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

  const handleAddQuestion = () => {
    // Default to TEXT when adding a new row
    setNewQuestions([...newQuestions, { id: Date.now(), type: 'TEXT', text: '', options: '', isRequired: true }]);
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

          <div className={styles.questionsList}>
            {newQuestions.map((q, index) => (
              <div key={q.id} className={styles.questionRow}>
                
                {/* Drag / Reorder Controls */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <button type="button" onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0} style={{ background: 'transparent', border: 'none', color: index === 0 ? '#333' : '#888', cursor: 'pointer', fontSize: '0.8rem' }}>▲</button>
                  <button type="button" onClick={() => handleMoveQuestion(index, 'down')} disabled={index === newQuestions.length - 1} style={{ background: 'transparent', border: 'none', color: index === newQuestions.length - 1 ? '#333' : '#888', cursor: 'pointer', fontSize: '0.8rem' }}>▼</button>
                </div>

                {/* Question Text */}
                <input 
                  type="text" 
                  className={styles.inlineInput} 
                  placeholder="Question text..." 
                  value={q.text} 
                  onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                  required
                />

                {/* Question Type Selector */}
                <select 
                  className={styles.inlineSelect} 
                  value={q.type} 
                  onChange={(e) => handleUpdateQuestion(q.id, 'type', e.target.value)}
                >
                  <option value="TEXT">Long Text</option>
                  <option value="RATING">Star Rating</option>
                  <option value="EMOJI">Emoji Reaction</option>
                  <option value="RADIO">Multiple Choice</option>
                  <option value="CHECKBOX">Checkboxes</option>
                  <option value="DROPDOWN">Dropdown</option>
                </select>

                {/* Conditional Options Input for specific types */}
                {['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && (
                  <input 
                    type="text" 
                    className={styles.inlineOptionsInput} 
                    placeholder="Options (comma-separated)..." 
                    value={q.options || ''} 
                    onChange={(e) => handleUpdateQuestion(q.id, 'options', e.target.value)} 
                    required
                  />
                )}
                
                {/* Placeholder spacer if options are not needed to keep flex layout balanced */}
                {!['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && (
                  <div style={{ flex: 1.5 }}></div>
                )}

                {/* Required Toggle */}
                <label className={styles.requiredToggle}>
                  <input 
                    type="checkbox" 
                    checked={q.isRequired} 
                    onChange={(e) => handleUpdateQuestion(q.id, 'isRequired', e.target.checked)} 
                    style={{ width: '14px', height: '14px', accentColor: 'var(--color-ocean-blue-light)' }}
                  /> 
                  Req.
                </label>

                {/* Delete Button */}
                <button type="button" className={styles.iconBtn} onClick={() => handleRemoveQuestion(q.id)} title="Delete Question">✕</button>
              </div>
            ))}
          </div>

          <div className={styles.addBtnContainer}>
            <button type="button" onClick={handleAddQuestion} className={styles.addBtn}>
              + Add Question
            </button>
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
