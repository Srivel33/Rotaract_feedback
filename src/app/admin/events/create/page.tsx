"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create-event.module.css';
import Link from 'next/link';

type QuestionType = 'TEXT' | 'RATING' | 'EMOJI' | 'RADIO' | 'CHECKBOX' | 'DROPDOWN';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  isRequired: boolean;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    { id: 1, type: 'RADIO', text: 'Untitled Question', options: ['Option 1'], isRequired: false }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setNewQuestions([...newQuestions, { id: Date.now(), type: 'RADIO', text: '', options: ['Option 1'], isRequired: false }]);
  };

  const handleUpdateQuestion = (id: number, field: keyof Question, value: string | boolean) => {
    setNewQuestions(newQuestions.map(q => {
      if (q.id === id) {
        const updated = { ...q, [field]: value };
        // If switching to an options-based type and it has no options, initialize it
        if (field === 'type' && typeof value === 'string' && ['RADIO', 'CHECKBOX', 'DROPDOWN', 'EMOJI'].includes(value)) {
          if (!updated.options || updated.options.length === 0) {
            updated.options = ['Option 1'];
          }
          if (value === 'EMOJI' && (!updated.options || updated.options.length === 0 || updated.options[0] === 'Option 1')) {
             updated.options = ['🤩 Excellent', '🙂 Good', '😐 Average', '☹️ Poor'];
          }
        }
        return updated;
      }
      return q;
    }));
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

  const handleUpdateOption = (qId: number, oIndex: number, val: string) => {
    setNewQuestions(newQuestions.map(q => {
      if (q.id === qId) {
        const newOpts = [...q.options];
        newOpts[oIndex] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleAddOption = (qId: number) => {
    setNewQuestions(newQuestions.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: number, oIndex: number) => {
    setNewQuestions(newQuestions.map(q => {
      if (q.id === qId) {
        const newOpts = q.options.filter((_, idx) => idx !== oIndex);
        return { ...q, options: newOpts };
      }
      return q;
    }));
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
    } catch { 
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
              <div key={q.id} className={styles.questionCard}>
                
                {/* Drag Handle Top Center */}
                <div className={styles.dragHandleBar}>
                  <div className={styles.dragPill}>
                    <button type="button" onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0} title="Move Up">▲</button>
                    <span style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>⋮⋮</span>
                    <button type="button" onClick={() => handleMoveQuestion(index, 'down')} disabled={index === newQuestions.length - 1} title="Move Down">▼</button>
                  </div>
                </div>

                {/* Top Row: Question Text & Type Dropdown */}
                <div className={styles.questionTopRow}>
                  <input 
                    type="text" 
                    className={styles.questionTitleInput} 
                    placeholder="Question text" 
                    value={q.text} 
                    onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                    required
                  />
                  <select 
                    className={styles.questionTypeSelect} 
                    value={q.type} 
                    onChange={(e) => handleUpdateQuestion(q.id, 'type', e.target.value as QuestionType)}
                  >
                    <option value="TEXT">Short/Long answer</option>
                    <option value="RADIO">Multiple choice</option>
                    <option value="CHECKBOX">Checkboxes</option>
                    <option value="DROPDOWN">Dropdown</option>
                    <option value="RATING">Star Rating</option>
                    <option value="EMOJI">Emoji Reaction</option>
                  </select>
                </div>

                {/* Middle Row: Dynamic Preview & Options */}
                <div className={styles.questionMiddleRow}>
                  {q.type === 'TEXT' && (
                    <div className={styles.placeholderText}>Long answer text</div>
                  )}

                  {q.type === 'RATING' && (
                    <div className={styles.placeholderRating}>★ ★ ★ ★ ★</div>
                  )}

                  {['RADIO', 'CHECKBOX', 'DROPDOWN', 'EMOJI'].includes(q.type) && (
                    <div className={styles.optionsContainer}>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className={styles.optionRow}>
                          <div className={styles.optionIndicator}>
                            {q.type === 'RADIO' || q.type === 'EMOJI' ? '○' : q.type === 'CHECKBOX' ? '☐' : `${oIndex + 1}.`}
                          </div>
                          <input 
                            type="text" 
                            className={styles.optionInput} 
                            value={opt} 
                            onChange={(e) => handleUpdateOption(q.id, oIndex, e.target.value)} 
                            placeholder={q.type === 'EMOJI' ? 'e.g. 🤩 Excellent' : `Option ${oIndex + 1}`}
                            required
                          />
                          {q.options.length > 1 && (
                            <button type="button" className={styles.removeOptionBtn} onClick={() => handleRemoveOption(q.id, oIndex)}>✕</button>
                          )}
                        </div>
                      ))}
                      <div className={styles.addOptionRow}>
                        <div className={styles.optionIndicator}>
                          {q.type === 'RADIO' || q.type === 'EMOJI' ? '○' : q.type === 'CHECKBOX' ? '☐' : `${q.options.length + 1}.`}
                        </div>
                        <button type="button" className={styles.addOptionBtn} onClick={() => handleAddOption(q.id)}>
                          Add option
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Controls */}
                <div className={styles.questionBottomRow}>
                  <button type="button" className={styles.iconBtn} onClick={() => {
                    const dupe = {...q, id: Date.now()};
                    setNewQuestions([...newQuestions.slice(0, index+1), dupe, ...newQuestions.slice(index+1)]);
                  }} title="Duplicate">
                    📄
                  </button>
                  <button type="button" className={styles.iconBtn} onClick={() => handleRemoveQuestion(q.id)} title="Delete">
                    🗑️
                  </button>
                  <div className={styles.divider}></div>
                  <label className={styles.requiredToggle}>
                    Required
                    <input 
                      type="checkbox" 
                      className={styles.switchToggle}
                      checked={q.isRequired} 
                      onChange={(e) => handleUpdateQuestion(q.id, 'isRequired', e.target.checked)} 
                    /> 
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.addBtnContainer}>
            <button type="button" onClick={handleAddQuestion} className={styles.addQuestionBtn}>
              + Add new question
            </button>
          </div>

          <div className={styles.submitSection}>
            <button type="submit" className={styles.publishBtn} disabled={loading}>
              {loading ? "Publishing..." : "Publish Event & Form"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
