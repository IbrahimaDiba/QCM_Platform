import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CheckCircle, XCircle, ArrowRight, Home, Check, X } from 'lucide-react';

export default function QuizResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        score,
        total,
        quizTitle,
        percentage,
        questions = [],
        userAnswers = {}
    } = location.state || { score: 0, total: 0, quizTitle: 'Quiz' };

    let feedback = '';
    let color = '';

    if (percentage >= 80) {
        feedback = 'Excellent travail !';
        color = 'var(--color-success)';
    } else if (percentage >= 50) {
        feedback = 'Bien essayé, continuez comme ça.';
        color = 'var(--color-warning)';
    } else {
        feedback = 'Il faut réviser davantage.';
        color = 'var(--color-danger)';
    }

    if (!location.state) {
        return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Aucun résultat à afficher. <Link to="/student">Retour</Link></div>;
    }

    return (
        <div className="quiz-result-container">
            <style>{`
                .quiz-result-container {
                    max-width: 800px;
                    margin: 4rem auto;
                    padding: 0 1rem 4rem 1rem;
                }

                .result-card {
                    padding: 3rem;
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .correction-card {
                    padding: 1.5rem;
                }

                @media (max-width: 768px) {
                    .quiz-result-container {
                        margin: 2rem auto;
                        padding-bottom: 2rem;
                    }

                    .result-card {
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    }

                    .result-card h1 {
                        font-size: 1.5rem !important;
                    }

                    .result-card div[style*="fontSize: 3rem"] {
                        font-size: 2.25rem !important;
                    }

                    .correction-card {
                        padding: 1rem;
                    }
                }
            `}</style>

            <Card className="result-card">
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    backgroundColor: `${color}20`,
                    color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    {percentage >= 50 ? <CheckCircle size={48} /> : <XCircle size={48} />}
                </div>

                <h1 className="t-h1" style={{ marginBottom: '0.5rem' }}>{feedback}</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{quizTitle}</p>

                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '1rem' }}>
                    {score} / {total}
                </div>

                <p style={{ fontSize: '1.25rem', color: color, fontWeight: 600, marginBottom: '3rem' }}>
                    {percentage}% de réussite
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate('/student')}>
                        <Home size={18} style={{ marginRight: '0.5rem' }} />
                        Accueil
                    </Button>
                </div>
            </Card>

            {questions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Correction détaillée</h2>
                    {questions.map((q, index) => {
                        const userAnswerId = userAnswers[q.id];
                        const cleanOptions = q.quiz_options || [];
                        const selectedOption = cleanOptions.find(o => o.id === userAnswerId);
                        const correctOption = cleanOptions.find(o => o.is_correct);
                        const isCorrect = selectedOption?.id === correctOption?.id;

                        return (
                            <Card key={q.id} className="correction-card" style={{
                                borderLeft: `4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`
                            }}>
                                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                                    <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {index + 1}.
                                    </span>
                                    <span>{q.text}</span>
                                </h3>

                                {q.explanation && !isCorrect && (
                                    <div style={{
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        backgroundColor: '#EFF6FF',
                                        border: '1px solid #BFDBFE',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#1E40AF',
                                        fontSize: '0.95rem'
                                    }}>
                                        <strong>💡 Explication du prof :</strong> {q.explanation}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {cleanOptions.map((option) => {
                                        const isSelected = userAnswerId === option.id;
                                        const isTheCorrectOne = option.is_correct;

                                        let borderColor = 'var(--color-border)';
                                        let bgColor = 'transparent';
                                        let textColor = 'inherit';

                                        if (isTheCorrectOne) {
                                            borderColor = 'var(--color-success)';
                                            bgColor = '#F0FDF4';
                                            textColor = 'var(--color-success)';
                                        } else if (isSelected && !isTheCorrectOne) {
                                            borderColor = 'var(--color-danger)';
                                            bgColor = '#FEF2F2';
                                            textColor = 'var(--color-danger)';
                                        }

                                        return (
                                            <div
                                                key={option.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid',
                                                    borderColor,
                                                    backgroundColor: bgColor,
                                                    color: textColor
                                                }}
                                            >
                                                <div style={{ width: '24px', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                                                    {isTheCorrectOne && <Check size={20} />}
                                                    {isSelected && !isTheCorrectOne && <X size={20} />}
                                                </div>
                                                <span>{option.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
