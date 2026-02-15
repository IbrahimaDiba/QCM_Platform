import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle, Check, X, Clock, Calendar, User, BookOpen, AlertCircle, Users, UserRound, FileText, CalendarRange } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TeacherResultDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResultDetail();
    }, [id]);

    const fetchResultDetail = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_results')
                .select(`
                    *,
                    profiles!student_id (full_name, class_level),
                    quizzes!quiz_id (
                        title, 
                        description,
                        questions (
                            id, 
                            text,
                            quiz_options (*)
                        )
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setResult(data);
        } catch (error) {
            console.error('Error fetching result detail:', error);
            alert('Erreur lors du chargement des détails du résultat');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p>Chargement des détails...</p>
            </div>
        );
    }

    if (!result) return <div style={{ padding: '2rem' }}>Résultat introuvable.</div>;

    const { quizzes: quiz, profiles: student } = result;
    const userAnswers = result.answers || {};
    const isAnswersEmpty = Object.keys(userAnswers).length === 0;

    // Check if we should have answers (score > 0 or not empty result) but don't
    // If the student got 0 score, they might have answered nothing, so we can't fully distinguish
    // between "no data saved" and "student submitted empty". 
    // But usually if they submit, we save {}; if they answer some, we save {id: ans}.
    // If the column didn't exist, it might be null or undefined.

    return (
        <div className="result-detail-container">
            <div className="header-section">
                <Button variant="outline" onClick={() => navigate('/teacher/results')} style={{ padding: '0.625rem' }}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="t-h2">Correction de l'étudiant</h1>
            </div>

            {/* Student & Quiz Info */}
            <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div className="info-grid">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            <UserRound size={18} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Étudiant</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{student?.full_name}</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>Classe: {student?.class_level}</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            <FileText size={18} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Examen</span>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{quiz?.title}</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>{result.score} / {result.total_score} ({result.percentage}%)</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            <CalendarRange size={18} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Date</span>
                        </div>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {new Date(result.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p style={{ color: 'var(--color-text-muted)' }}>Durée: {result.duration_taken}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            padding: '1rem 2rem',
                            borderRadius: 'var(--radius-xl)',
                            backgroundColor: result.passed ? '#ECFDF5' : '#FEF2F2',
                            color: result.passed ? '#059669' : '#DC2626',
                            textAlign: 'center',
                            border: `2px solid ${result.passed ? '#D1FAE5' : '#FEE2E2'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
                                {result.passed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                {result.passed ? 'RÉUSSI' : 'ÉCHOUÉ'}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Warning if no answers data */}
            {isAnswersEmpty && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: 'var(--radius-lg)',
                    color: '#92400E',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{ flexShrink: 0 }}><AlertCircle size={20} /></div>
                    <p style={{ fontSize: '0.9rem' }}>
                        <strong>Note :</strong> Les détails des réponses ne sont pas disponibles pour ce résultat.
                        Cela peut être dû à un examen passé avant la mise à jour du système d'enregistrement des réponses.
                    </p>
                </div>
            )}

            {/* Questions View */}
            <div className="question-list">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Détails des questions</h2>
                {quiz.questions?.map((q, index) => {
                    // Note: If we don't store individual answers, we can't show which one they chose.
                    // But typically in a QCM app, we SHOULD store them.
                    // For now, let's show the correct answer and the options.
                    return (
                        <Card key={q.id} style={{ padding: '1.5rem' }}>
                            <div className="question-text-row" style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontWeight: 700
                                }}>
                                    {index + 1}
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem' }}>{q.text}</h3>
                            </div>

                            {q.explanation && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.9rem',
                                    fontStyle: 'italic',
                                    marginLeft: '3rem'
                                }}>
                                    <strong>Commentaire pédagogique :</strong> {q.explanation}
                                </div>
                            )}

                            <div className="question-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {q.quiz_options?.map((option, optIdx) => {
                                    const isSelected = userAnswers[q.id] === option.id;
                                    const isCorrect = option.is_correct;

                                    let borderColor = 'var(--color-border)';
                                    let bgColor = 'white';

                                    if (isCorrect) {
                                        borderColor = '#059669';
                                        bgColor = '#F0FDF4';
                                    } else if (isSelected) {
                                        borderColor = '#DC2626';
                                        bgColor = '#FEF2F2';
                                    }

                                    return (
                                        <div key={option.id} style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: `2px solid ${borderColor}`,
                                            backgroundColor: bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            position: 'relative'
                                        }}>
                                            <span style={{
                                                width: '24px', height: '24px',
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: isCorrect ? '#059669' : isSelected ? '#DC2626' : '#E5E7EB',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            <span style={{ flex: 1, fontWeight: isCorrect || isSelected ? 600 : 400, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {option.text}
                                                {isSelected && (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        fontSize: '0.75rem',
                                                        fontStyle: 'italic',
                                                        opacity: 0.8,
                                                        color: isCorrect ? '#059669' : '#DC2626'
                                                    }}>
                                                        <Users size={12} />
                                                        (Réponse de l'étudiant)
                                                    </span>
                                                )}
                                            </span>
                                            {isCorrect && <Check size={20} style={{ color: '#059669' }} />}
                                            {isSelected && !isCorrect && <X size={20} style={{ color: '#DC2626' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <style>{`
                .result-detail-container {
                    max-width: 1000px; 
                    margin: 0 auto; 
                    padding: 2rem; 
                    padding-bottom: 5rem;
                }
                
                .header-section {
                    display: flex; 
                    align-items: center; 
                    margin-bottom: 2rem; 
                    gap: 1rem;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                }
                
                .question-list {
                    display: flex; 
                    flex-direction: column; 
                    gap: 1.5rem;
                }
                
                .question-card-content {
                    padding-left: 3rem;
                }
                
                @media (max-width: 768px) {
                    .result-detail-container {
                        padding: 1rem;
                        padding-bottom: 4rem;
                    }
                    
                    .header-section {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .question-card-content {
                        padding-left: 0;
                        margin-top: 1rem;
                    }
                    
                    .question-text-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.75rem;
                    }
                }
                
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
