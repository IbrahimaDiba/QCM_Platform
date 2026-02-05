import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowRight, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizTaker() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (!quiz || timeLeft <= 0) {
            if (quiz && timeLeft <= 0) handleSubmit();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, quiz]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    questions (
                        *,
                        quiz_options (*)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setQuiz(data);
            setTimeLeft(data.time_limit * 60);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Erreur lors du chargement du quiz');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (questionId, optionId) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            // Calculate Score
            let score = 0;
            quiz.questions.forEach(q => {
                const selectedOption = q.quiz_options.find(o => o.id === answers[q.id]);
                if (selectedOption?.is_correct) {
                    score++;
                }
            });

            const total = quiz.questions.length;
            const percentage = Math.round((score / total) * 100);
            const passed = percentage >= 50;

            // Save to DB
            const resultPayload = {
                student_id: user.id,
                quiz_id: quiz.id,
                score,
                total_score: total,
                percentage,
                passed,
                duration_taken: `${Math.floor((quiz.time_limit * 60 - timeLeft) / 60)} min`,
                answers: answers
            };

            const { error } = await supabase.from('student_results').insert([resultPayload]);
            if (error) throw error;

            // Navigate to results
            navigate(`/student/result/${id}`, {
                state: {
                    score,
                    total,
                    quizTitle: quiz.title,
                    percentage,
                    passed,
                    questions: quiz.questions,
                    userAnswers: answers
                }
            });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Erreur lors de la soumission: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #E5E7EB',
                    borderTopColor: '#4F46E5',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Chargement du quiz...</p>
            </div>
        );
    }

    if (!quiz) return <div style={{ padding: '2rem' }}>Quiz introuvable.</div>;

    const isComplete = quiz.questions.length === Object.keys(answers).length;
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = (answeredCount / quiz.questions.length) * 100;

    return (
        <>
            <style>{`
                .quiz-taker-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 1rem;
                    padding-bottom: 4rem;
                }
                
                .quiz-header {
                    position: sticky;
                    top: 1rem;
                    z-index: 100;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 1.75rem;
                    border-radius: var(--radius-xl);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    margin-bottom: 2rem;
                    color: white;
                }
                
                .quiz-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    margin-bottom: 1rem;
                }
                
                .quiz-timer {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    font-size: 1.25rem;
                    backdrop-filter: blur(10px);
                }
                
                .quiz-timer.warning {
                    background: rgba(239, 68, 68, 0.3);
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: white;
                    border-radius: var(--radius-full);
                    transition: width 0.3s ease;
                }
                
                .question-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    border: 1px solid var(--color-border);
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .question-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                
                .question-number {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 50%;
                    font-weight: 700;
                    margin-right: 1rem;
                }
                
                .option-label {
                    display: flex;
                    align-items: center;
                    padding: 1.25rem;
                    border-radius: var(--radius-lg);
                    border: 2px solid var(--color-border);
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }
                
                .option-label:hover {
                    border-color: #667eea;
                    background: #F9FAFB;
                    transform: translateX(4px);
                }
                
                .option-label.selected {
                    border-color: #667eea;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                }
                
                .option-radio {
                    width: 1.5rem;
                    height: 1.5rem;
                    margin-right: 1rem;
                    cursor: pointer;
                    accent-color: #667eea;
                }
                
                @media (max-width: 768px) {
                    .quiz-taker-container {
                        padding: 0.75rem;
                    }
                    
                    .quiz-header {
                        padding: 1.25rem;
                        top: 0.5rem;
                    }
                    
                    .quiz-header-content {
                        gap: 1rem;
                    }
                    
                    .quiz-header h1 {
                        font-size: 1.25rem;
                    }
                    
                    .quiz-timer {
                        font-size: 1.125rem;
                        padding: 0.625rem 1rem;
                    }
                    
                    .question-card {
                        padding: 1.5rem;
                    }
                    
                    .option-label {
                        padding: 1rem;
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>

            <div className="quiz-taker-container">
                {/* Header with Timer */}
                <div className="quiz-header">
                    <div className="quiz-header-content">
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {quiz.title}
                            </h1>
                            <p style={{ fontSize: '1rem', opacity: 0.95 }}>
                                {quiz.description || 'Répondez à toutes les questions'}
                            </p>
                        </div>
                        <div className={`quiz-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                            <Clock size={24} />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.95 }}>
                            <span>Progression</span>
                            <span>{answeredCount} / {quiz.questions.length} questions</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {quiz.questions.map((q, index) => (
                        <div key={q.id} className="question-card">
                            <div style={{ display: 'flex', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div className="question-number">{index + 1}</div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4, flex: 1 }}>
                                    {q.text}
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {q.quiz_options && q.quiz_options.length > 0 ? (
                                    q.quiz_options.map((option, optIndex) => (
                                        <label
                                            key={option.id}
                                            className={`option-label ${answers[q.id] === option.id ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                checked={answers[q.id] === option.id}
                                                onChange={() => handleSelect(q.id, option.id)}
                                                className="option-radio"
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: answers[q.id] === option.id ? '#667eea' : '#E5E7EB',
                                                        color: answers[q.id] === option.id ? 'white' : '#6B7280',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                                                        {option.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div style={{
                                        padding: '1.5rem',
                                        backgroundColor: '#FEF2F2',
                                        color: '#DC2626',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid #FECACA',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <AlertCircle size={24} />
                                        <div>
                                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Aucune option disponible</p>
                                            <p style={{ fontSize: '0.875rem' }}>Veuillez contacter votre enseignant.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: isComplete ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : '#F9FAFB',
                    borderRadius: 'var(--radius-xl)',
                    border: `2px solid ${isComplete ? '#667eea' : 'var(--color-border)'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isComplete ? (
                            <>
                                <CheckCircle size={24} style={{ color: '#059669' }} />
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>Toutes les questions répondues !</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Vous pouvez soumettre votre examen</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={24} style={{ color: '#F59E0B' }} />
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                                        {quiz.questions.length - answeredCount} question{quiz.questions.length - answeredCount > 1 ? 's' : ''} restante{quiz.questions.length - answeredCount > 1 ? 's' : ''}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Répondez à toutes les questions avant de soumettre</p>
                                </div>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isComplete || submitting}
                        style={{
                            opacity: isComplete ? 1 : 0.5,
                            padding: '1rem 2rem',
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            background: isComplete ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
                        }}
                    >
                        {submitting ? 'Soumission...' : "Terminer l'examen"}
                        <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </Button>
                </div>
            </div>
        </>
    );
}
