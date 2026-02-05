import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Edit2, BookOpen, Users, Clock, Search, Filter, Calendar, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (user) {
            fetchQuizzes();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    questions (count)
                `)
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.')) {
            try {
                const { error } = await supabase.from('quizzes').delete().eq('id', id);
                if (error) throw error;
                setQuizzes(quizzes.filter(q => q.id !== id));
            } catch (error) {
                alert('Erreur lors de la suppression: ' + error.message);
            }
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.target_class?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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
                <p style={{ color: 'var(--color-text-muted)' }}>Chargement de vos examens...</p>
            </div>
        );
    }

    return (
        <div className="quiz-list-container">
            {/* Header */}
            <div className="quiz-header">
                <div>
                    <h1 className="t-h2" style={{ marginBottom: '0.5rem' }}>Mes Examens</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                        {filteredQuizzes.length} examen{filteredQuizzes.length !== 1 ? 's' : ''} trouvé{filteredQuizzes.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/teacher/quizzes/new')}
                    style={{
                        padding: '0.875rem 1.75rem',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                    }}
                >
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    Créer un Quiz
                </Button>
            </div>

            {/* Filters */}
            <Card className="filters-card">
                <div className="filters-content">
                    <div className="search-wrapper">
                        <Search size={20} style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)'
                        }} />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou classe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Filter size={18} style={{ color: 'var(--color-text-muted)' }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'white',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Active">Publiés</option>
                            <option value="Draft">Brouillons</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Quiz Grid */}
            {filteredQuizzes.length > 0 ? (
                <div className="quiz-grid">
                    {filteredQuizzes.map((quiz) => (
                        <div key={quiz.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                            }}
                            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                        >
                            {/* Status Bar */}
                            <div style={{
                                height: '6px',
                                background: quiz.status === 'Active'
                                    ? 'linear-gradient(90deg, #059669, #34D399)'
                                    : 'linear-gradient(90deg, #6B7280, #9CA3AF)'
                            }} />

                            {/* Content */}
                            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontWeight: 700,
                                                fontSize: '1.25rem',
                                                marginBottom: '0.5rem',
                                                color: 'var(--color-text)',
                                                lineHeight: 1.3
                                            }}>
                                                {quiz.title}
                                            </h3>
                                            <div style={{
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: quiz.status === 'Active' ? '#ECFDF5' : '#F3F4F6',
                                                color: quiz.status === 'Active' ? '#059669' : '#6B7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}>
                                                {quiz.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {quiz.status === 'Active' ? 'Publié' : 'Brouillon'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                        padding: '1rem',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                color: '#4F46E5',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <BookOpen size={16} />
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                    {quiz.questions?.[0]?.count || 0}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                Questions
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                color: '#059669',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <Clock size={16} />
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                    {quiz.time_limit}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                Minutes
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                color: '#D97706',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <Users size={16} />
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                    {quiz.target_class || '—'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                Classe
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {quiz.description && (
                                        <p style={{
                                            color: 'var(--color-text-muted)',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5,
                                            marginBottom: '1.5rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {quiz.description}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--color-border)'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/teacher/results?quizId=${quiz.id}`);
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)',
                                            backgroundColor: 'white',
                                            color: '#059669',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ECFDF5';
                                            e.currentTarget.style.borderColor = '#059669';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                        }}
                                        title="Voir les résultats"
                                    >
                                        <ClipboardList size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/teacher/quizzes/${quiz.id}/edit`);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)',
                                            backgroundColor: 'white',
                                            color: '#4F46E5',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#EEF2FF';
                                            e.currentTarget.style.borderColor = '#4F46E5';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                        }}
                                        title="Modifier l'examen"
                                    >
                                        <Edit2 size={16} />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(quiz.id);
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid #FEE2E2',
                                            backgroundColor: 'white',
                                            color: '#DC2626',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                                            e.currentTarget.style.borderColor = '#DC2626';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#FEE2E2';
                                        }}
                                        title="Supprimer l'examen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Date */}
                                <div style={{
                                    marginTop: '1rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <Calendar size={14} />
                                    Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '4rem' }}>
                    <BookOpen size={64} style={{
                        color: 'var(--color-text-muted)',
                        margin: '0 auto 1.5rem auto',
                        opacity: 0.3
                    }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        {searchTerm || filterStatus !== 'all' ? 'Aucun examen trouvé' : 'Aucun examen créé'}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Essayez de modifier vos filtres de recherche.'
                            : 'Commencez par créer votre premier quiz pour vos étudiants.'
                        }
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                        <Button onClick={() => navigate('/teacher/quizzes/new')} style={{ padding: '0.875rem 1.75rem' }}>
                            <Plus size={20} style={{ marginRight: '0.5rem' }} />
                            Créer mon premier quiz
                        </Button>
                    )}
                </Card>
            )}

            <style>{`
                .quiz-list-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .quiz-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .filters-card {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                }

                .filters-content {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .search-wrapper {
                    flex: 1;
                    min-width: 300px; 
                    position: relative;
                }

                .quiz-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                @media (max-width: 768px) {
                    .quiz-list-container {
                        padding: 1rem;
                    }

                    .quiz-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    
                    .quiz-header h1 {
                        font-size: 1.75rem;
                    }

                    .filters-card {
                        padding: 1rem;
                    }
                    
                    .search-wrapper {
                        min-width: 100%;
                    }

                    .quiz-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
