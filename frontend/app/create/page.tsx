'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CreateAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    subject: '',
    dueDate: '',
    questionTypes: [] as string[],
    numberOfQuestions: '',
    totalMarks: '',
    difficulty: 'medium',
    additionalInstructions: ''
  });

  const questionTypeOptions = ['MCQ', 'Short Answer', 'Long Answer', 'True/False'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionType = (type: string) => {
    if (form.questionTypes.includes(type)) {
      setForm({ ...form, questionTypes: form.questionTypes.filter(t => t !== type) });
    } else {
      setForm({ ...form, questionTypes: [...form.questionTypes, type] });
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.subject || !form.dueDate || !form.numberOfQuestions || !form.totalMarks) {
      setError('Please fill all required fields');
      return;
    }
    if (Number(form.numberOfQuestions) <= 0 || Number(form.totalMarks) <= 0) {
      setError('Questions and marks must be positive numbers');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post('https://vedaai-project.onrender.com/api/assignments/create', {
        ...form,
        numberOfQuestions: Number(form.numberOfQuestions),
        totalMarks: Number(form.totalMarks)
      });
      router.push(`/result/${response.data.assignmentId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    border: '2px solid #e0e7ff',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#1e1b4b',
    backgroundColor: '#f8f9ff',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4338ca',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          padding: '32px 40px',
          color: '#ffffff'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎓</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0 }}>Create Assignment</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '14px' }}>Generate AI-powered question papers instantly</p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px 40px' }}>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={labelStyle}>Assignment Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Mid-Term Exam" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Subject *</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Java Programming" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Due Date *</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Question Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {questionTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => handleQuestionType(type)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: '2px solid',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: form.questionTypes.includes(type) ? '#4f46e5' : '#eef2ff',
                      color: form.questionTypes.includes(type) ? '#ffffff' : '#4f46e5',
                      borderColor: form.questionTypes.includes(type) ? '#4f46e5' : '#c7d2fe'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>No. of Questions *</label>
                <input type="number" name="numberOfQuestions" value={form.numberOfQuestions} onChange={handleChange} placeholder="e.g. 10" min="1" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Marks *</label>
                <input type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} placeholder="e.g. 100" min="1" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Difficulty Level</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} style={inputStyle}>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Additional Instructions</label>
              <textarea
                name="additionalInstructions"
                value={form.additionalInstructions}
                onChange={handleChange}
                placeholder="Any specific instructions for the AI..."
                rows={3}
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(79,70,229,0.4)',
                letterSpacing: '0.02em'
              }}
            >
              {loading ? '⏳ Generating...' : '✨ Generate Question Paper'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}