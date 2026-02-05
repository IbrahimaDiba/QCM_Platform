import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Save, ArrowLeft, BookOpen, Clock, Target, FileText, Settings2, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSchools } from '../../contexts/SchoolContext';

export default function QuizEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { user } = useAuth();
    const { schools } = useSchools();
    const [loading, setLoading] = useState(false);

    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        targetClass: '',
        timeLimit: 20,
        establishmentId: null,
        questions: [
            { id: Date.now(), text: '', options: [{ id: Date.now() + 1, text: '', isCorrect: false }, { id: Date.now() + 2, text: '', isCorrect: false }] }
        ]
    });

    useEffect(() => {
        if (isEditing) {
            fetchQuizData();
        }
    }, [id]);

    const fetchQuizData = async () => {
        try {
            setLoading(true);
            const { data: quizData, error: quizError } = await supabase
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

            if (quizError) throw quizError;

            setQuiz({
                title: quizData.title,
                description: quizData.description,
                targetClass: quizData.target_class,
                timeLimit: quizData.time_limit,
                establishmentId: quizData.establishment_id,
                questions: quizData.questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    options: q.quiz_options.map(o => ({
                        id: o.id,
                        text: o.text,
                        isCorrect: o.is_correct
                    }))
                }))
            });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Erreur lors du chargement du quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (qId, field, value) => {
        setQuiz({
            ...quiz,
            questions: quiz.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
        });
    };

    const handleOptionChange = (qId, oId, field, value) => {
        setQuiz({
            ...quiz,
            questions: quiz.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: q.options.map(o => o.id === oId ? { ...o, [field]: value } : o)
                    };
                }
                return q;
            })
        });
    };

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, {
                id: Date.now(),
                text: '',
                options: [
                    { id: Date.now() + 1, text: '', isCorrect: false },
                    { id: Date.now() + 2, text: '', isCorrect: false }
                ]
            }]
        });
    };

    const removeQuestion = (qId) => {
        if (quiz.questions.length === 1) {
            alert('Vous devez avoir au moins une question.');
            return;
        }
        setQuiz({
            ...quiz,
            questions: quiz.questions.filter(q => q.id !== qId)
        });
    };

    const addOption = (qId) => {
        setQuiz({
            ...quiz,
            questions: quiz.questions.map(q => {
                if (q.id === qId) {
                    return {
                        ...q,
                        options: [...q.options, { id: Date.now(), text: '', isCorrect: false }]
                    };
                }
                return q;
            })
        });
    };

    const removeOption = (qId, oId) => {
        setQuiz({
            ...quiz,
            questions: quiz.questions.map(q => {
                if (q.id === qId && q.options.length > 2) {
                    return {
                        ...q,
                        options: q.options.filter(o => o.id !== oId)
                    };
                }
                return q;
            })
        });
    };

    const handleSave = async () => {
        if (!quiz.title || !quiz.targetClass) {
            alert('Veuillez remplir le titre et la classe cible.');
            return;
        }

        try {
            setLoading(true);

            const userSchoolId = user.school_id || user.user_metadata?.school_id;
            const schoolId = isEditing ? quiz.establishmentId : userSchoolId;

            if (!schoolId && !user.app_metadata?.role === 'admin') {
                alert("Erreur critique : École non identifiée.");
                setLoading(false);
                return;
            }

            const quizPayload = {
                title: quiz.title,
                description: quiz.description,
                time_limit: quiz.timeLimit,
                target_class: quiz.targetClass,
                establishment_id: schoolId,
                status: 'Active'
            };

            if (!isEditing) {
                quizPayload.teacher_id = user.id;
            }

            let quizId = id;
            if (isEditing) {
                const { error } = await supabase.from('quizzes').update(quizPayload).eq('id', id);
                if (error) throw error;
                await supabase.from('questions').delete().eq('quiz_id', id);
            } else {
                const { data, error } = await supabase.from('quizzes').insert([quizPayload]).select().single();
                if (error) throw error;
                quizId = data.id;
            }

            for (const q of quiz.questions) {
                const { data: qData, error: qError } = await supabase
                    .from('questions')
                    .insert([{ quiz_id: quizId, text: q.text }])
                    .select()
                    .single();

                if (qError) throw qError;

                const optionsPayload = q.options.map(o => ({
                    question_id: qData.id,
                    text: o.text,
                    is_correct: o.isCorrect
                }));

                const { error: oError } = await supabase.from('quiz_options').insert(optionsPayload);
                if (oError) throw oError;
            }

            alert('Quiz sauvegardé avec succès !');
            if (user.role === 'admin' || user.user_metadata?.role === 'admin') {
                navigate('/admin/exams');
            } else {
                navigate('/teacher/quizzes');
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
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
                <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .quiz-editor-container {
                    padding-bottom: 8rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-left: 2rem;
                    padding-right: 2rem;
                }
                
                .quiz-editor-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }
                
                .quiz-info-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    border: 1px solid var(--color-border);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    margin-bottom: 2rem;
                }
                
                .quiz-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                
                .question-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    border: 2px solid var(--color-border);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .question-card:hover {
                    border-color: #667eea;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                
                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #F3F4F6;
                }
                
                .question-number-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    font-size: 1rem;
                }
                
                .option-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: #F9FAFB;
                    border-radius: var(--radius-lg);
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                
                .option-row:hover {
                    background: white;
                    border-color: #E5E7EB;
                }
                
                .option-row.correct {
                    background: #ECFDF5;
                    border-color: #059669;
                }
                
                .save-bar {
                    position: fixed;
                    bottom: 0;
                    left: 250px; /* Default sidebar width */
                    right: 0;
                    padding: 1.25rem 2rem;
                    background: white;
                    border-top: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    z-index: 100;
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                
                @media (max-width: 1024px) {
                    .save-bar {
                        left: 0;
                    }
                    
                    .quiz-editor-container {
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .quiz-editor-container {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                    
                    .quiz-info-card {
                        padding: 1.5rem;
                    }
                    
                    .quiz-info-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .question-card {
                        padding: 1.5rem;
                    }
                    
                    .option-row {
                        flex-wrap: wrap;
                    }
                    
                    .option-row > input[type="text"] {
                        min-width: 200px;
                    }
                    
                    .save-bar {
                        padding: 1rem;
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                        text-align: center;
                        border-top: 1px solid #E5E7EB;
                    }
                    
                    .save-bar > div:first-child {
                         justify-content: center;
                         margin-bottom: 0.5rem;
                    }
                    
                    .save-bar > div:last-child {
                         display: grid;
                         grid-template-columns: 1fr 1fr;
                         gap: 1rem;
                         width: 100%;
                    }
                    
                    .save-bar button {
                        width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .quiz-editor-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    
                   .save-bar > div:last-child {
                         grid-template-columns: 1fr;
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="quiz-editor-container">
                <div className="quiz-editor-header">
                    <Button variant="outline" onClick={() => {
                        if (user.role === 'admin' || user.user_metadata?.role === 'admin') {
                            navigate('/admin/exams');
                        } else {
                            navigate('/teacher/quizzes');
                        }
                    }} style={{ padding: '0.75rem' }}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="t-h2" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        {isEditing ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}
                    </h1>
                </div>

                {/* Quiz Information */}
                <div className="quiz-info-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Settings2 size={22} style={{ color: '#4F46E5' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                            Paramètres du Quiz
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FileText size={16} style={{ color: 'var(--color-text-muted)' }} />
                                <label style={{ fontWeight: 600, color: 'var(--color-text)' }}>Titre du Quiz *</label>
                            </div>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                placeholder="Ex: Mathématiques - Chapitre 1"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--color-border)',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                Description
                            </label>
                            <textarea
                                value={quiz.description}
                                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                placeholder="Instructions pour les élèves..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--color-border)',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>
                        <div className="quiz-info-grid">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                                    <label style={{ fontWeight: 600, color: 'var(--color-text)' }}>Durée (minutes) *</label>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={quiz.timeLimit}
                                    onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--color-border)',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Target size={16} style={{ color: 'var(--color-text-muted)' }} />
                                    <label style={{ fontWeight: 600, color: 'var(--color-text)' }}>Classe Cible *</label>
                                </div>
                                <select
                                    value={quiz.targetClass}
                                    onChange={(e) => setQuiz({ ...quiz, targetClass: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--color-border)',
                                        fontSize: '1rem',
                                        backgroundColor: 'white',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                >
                                    <option value="">Sélectionnez une classe cible</option>
                                    <option value="6eme">6ème</option>
                                    <option value="5eme">5ème</option>
                                    <option value="4eme">4ème</option>
                                    <option value="3eme">3ème</option>
                                    <option value="2nde">Seconde</option>
                                    <option value="1ere">Première</option>
                                    <option value="terminale">Terminale</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <HelpCircle size={22} style={{ color: '#4F46E5' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                            Questions ({quiz.questions.length})
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {quiz.questions.map((q, qIndex) => (
                            <div key={q.id} className="question-card">
                                <div className="question-header">
                                    <div className="question-number-badge">
                                        Question {qIndex + 1}
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        style={{
                                            color: '#DC2626',
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        title="Supprimer la question"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Énoncé de la question
                                    </label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                        placeholder="Votre question ici..."
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid var(--color-border)',
                                            fontSize: '1.05rem',
                                            fontWeight: 500,
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Options de réponse (cochez la bonne réponse)
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {q.options.map((option, oIndex) => (
                                            <div key={option.id} className={`option-row ${option.isCorrect ? 'correct' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={option.isCorrect}
                                                    onChange={() => {
                                                        const newOptions = q.options.map(o => ({ ...o, isCorrect: o.id === option.id }));
                                                        setQuiz({
                                                            ...quiz,
                                                            questions: quiz.questions.map(x => x.id === q.id ? { ...x, options: newOptions } : x)
                                                        });
                                                    }}
                                                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: '#059669' }}
                                                />
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: option.isCorrect ? '#059669' : '#E5E7EB',
                                                    color: option.isCorrect ? 'white' : '#6B7280',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {String.fromCharCode(65 + oIndex)}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(q.id, option.id, 'text', e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.625rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'white'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => removeOption(q.id, option.id)}
                                                    style={{
                                                        color: '#DC2626',
                                                        padding: '0.5rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={() => addOption(q.id)}
                                            style={{
                                                alignSelf: 'flex-start',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                borderStyle: 'dashed'
                                            }}
                                        >
                                            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Ajouter une option
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            onClick={addQuestion}
                            style={{
                                alignSelf: 'center',
                                borderStyle: 'dashed',
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            <Plus size={20} style={{ marginRight: '0.5rem' }} />
                            Ajouter une question
                        </Button>
                    </div>
                </div>
            </div>

            {/* Save Bar */}
            <div className="save-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} style={{ color: '#667eea' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''} • {quiz.questions.reduce((acc, q) => acc + q.options.length, 0)} options
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => {
                        if (user.role === 'admin' || user.user_metadata?.role === 'admin') {
                            navigate('/admin/exams');
                        } else {
                            navigate('/teacher/quizzes');
                        }
                    }}>Annuler</Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 600
                        }}
                    >
                        <Save size={18} style={{ marginRight: '0.5rem' }} />
                        {loading ? 'Enregistrement...' : 'Enregistrer le Quiz'}
                    </Button>
                </div>
            </div>
        </>
    );
}
