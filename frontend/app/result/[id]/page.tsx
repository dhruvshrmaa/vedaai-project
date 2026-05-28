'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Question {
  questionNumber: number;
  text: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Section {
  name: string;
  instruction: string;
  questions: Question[];
}

interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: Section[];
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper: GeneratedPaper | null;
  errorMessage?: string;
}

const difficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return { backgroundColor: '#dcfce7', color: '#16a34a' };
    case 'medium': return { backgroundColor: '#fef9c3', color: '#ca8a04' };
    case 'hard': return { backgroundColor: '#fee2e2', color: '#dc2626' };
    default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

export default function ResultPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`http://vedaai-project.onrender.com/api/assignments/${id}`);
      setAssignment(response.data);
      if (response.data.status === 'pending' || response.data.status === 'processing') {
        setTimeout(fetchAssignment, 3000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  if (loading || assignment?.status === 'pending' || assignment?.status === 'processing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px' }}>Generating Question Paper...</h2>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>AI is working on your paper. Please wait!</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (assignment?.status === 'failed') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '22px', color: '#dc2626', margin: '0 0 12px' }}>❌ Generation Failed</h2>
          <p style={{ color: '#6b7280', margin: '0 0 16px', fontSize: '14px', lineHeight: '1.6' }}>
            {assignment.errorMessage || 'Something went wrong. Please try again.'}
          </p>
          <a href="/create" style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block' }}>Try Again</a>
        </div>
      </div>
    );
  }

  const paper = assignment?.generatedPaper;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px 16px' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>

        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '16px', padding: '32px', marginBottom: '24px', color: '#ffffff', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px' }}>{paper?.title}</h1>
          <p style={{ opacity: 0.85, margin: '0 0 16px', fontSize: '15px' }}>Subject: {paper?.subject}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px' }}>
            <span>📝 Total Marks: <strong>{paper?.totalMarks}</strong></span>
            <span>⏱️ Duration: <strong>{paper?.duration}</strong></span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {['Name', 'Roll Number', 'Section'].map(field => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>{field}</label>
                <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '4px' }}></div>
              </div>
            ))}
          </div>
        </div>

        {paper?.sections.map((section, sIdx) => (
          <div key={sIdx} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 4px' }}>{section.name}</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '0 0 16px' }}>{section.instruction}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {section.questions.map((question, qIdx) => (
                <div key={qIdx} style={{ border: '1px solid #e0e7ff', borderRadius: '10px', padding: '14px 16px', backgroundColor: '#f8f9ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#4f46e5', minWidth: '24px' }}>{question.questionNumber}.</span>
                      <p style={{ margin: 0, color: '#1e1b4b', fontSize: '14px', lineHeight: '1.6' }}>{question.text}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>[{question.marks} marks]</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600', ...difficultyColor(question.difficulty) }}>
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <a href="/create" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontWeight: '700', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px' }}>
            ➕ Create New
          </a>
          <button onClick={() => window.print()} style={{ flex: 1, backgroundColor: '#f3f4f6', color: '#374151', fontWeight: '700', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            🖨️ Print / Save PDF
          </button>
        </div>

      </div>
    </div>
  );
}