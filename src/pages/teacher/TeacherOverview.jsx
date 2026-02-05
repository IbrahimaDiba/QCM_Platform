import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { BookOpen, CheckCircle, Clock, Plus, Users, TrendingUp, Calendar, ArrowRight, BarChart3, FileText, Award, AlertCircle, Eye, FileStack, Activity, UsersRound, GraduationCap, Trophy, ListChecks, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherOverview() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch teacher's quiz IDs
            const { data: teacherQuizzes } = await supabase
                .from('quizzes')
                .select('id')
                .eq('teacher_id', user.id);

            const quizIds = teacherQuizzes?.map(q => q.id) || [];

            // 2. Fetch Stats
            const { count: quizCount } = await supabase
                .from('quizzes')
                .select('*', { count: 'exact', head: true })
                .eq('teacher_id', user.id);

            const { count: activeQuizCount } = await supabase
                .from('quizzes')
                .select('*', { count: 'exact', head: true })
                .eq('teacher_id', user.id)
                .eq('status', 'Active');

            // Get results for teacher's quizzes
            const { data: resultsData } = await supabase
                .from('student_results')
                .select('score, percentage, quiz_id, created_at')
                .in('quiz_id', quizIds.length > 0 ? quizIds : [-1]);

            const participantCount = resultsData?.length || 0;
            const avgSuccess = participantCount > 0
                ? Math.round(resultsData.reduce((acc, r) => acc + r.percentage, 0) / participantCount)
                : 0;

            setStats([
                {
                    label: 'Total Examens',
                    value: quizCount?.toString() || '0',
                    icon: FileStack,
                    color: '#4F46E5',
                    bgColor: '#EEF2FF',
                    trend: '+2 ce mois'
                },
                {
                    label: 'Examens Actifs',
                    value: activeQuizCount?.toString() || '0',
                    icon: Activity,
                    color: '#059669',
                    bgColor: '#ECFDF5',
                    trend: `${activeQuizCount || 0} publiés`
                },
                {
                    label: 'Participations',
                    value: participantCount.toString(),
                    icon: UsersRound,
                    color: '#0EA5E9',
                    bgColor: '#F0F9FF',
                    trend: 'Total soumissions'
                },
                {
                    label: 'Taux de Réussite',
                    value: `${avgSuccess}%`,
                    icon: GraduationCap,
                    color: avgSuccess >= 70 ? '#059669' : '#D97706',
                    bgColor: avgSuccess >= 70 ? '#ECFDF5' : '#FFFBEB',
                    trend: avgSuccess >= 70 ? 'Excellent' : 'À améliorer'
                },
            ]);

            // 3. Fetch Recent Quizzes
            const { data: quizzes } = await supabase
                .from('quizzes')
                .select('*, questions(count)')
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentQuizzes(quizzes?.map(q => ({
                id: q.id,
                title: q.title,
                class: q.target_class,
                date: new Date(q.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: q.status,
                questionCount: q.questions?.[0]?.count || 0
            })) || []);

            // 4. Fetch Recent Results
            const { data: recentResultsData } = await supabase
                .from('student_results')
                .select(`
                    *,
                    profiles!student_id (full_name),
                    quizzes!quiz_id (title)
                `)
                .in('quiz_id', quizIds.length > 0 ? quizIds : [-1])
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentResults(recentResultsData?.map(r => ({
                studentName: r.profiles?.full_name || 'Étudiant inconnu',
                quizTitle: r.quizzes?.title || 'Quiz inconnu',
                score: r.score,
                totalScore: r.total_score,
                percentage: r.percentage,
                passed: r.passed,
                date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                id: r.id
            })) || []);

        } catch (error) {
            console.error('dashboard error:', error);
        } finally {
            setLoading(false);
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
                <p style={{ color: 'var(--color-text-muted)' }}>Chargement du tableau de bord...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .teacher-overview-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-bottom: 4rem;
                }
                
                .teacher-header {
                    margin-bottom: 3rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: var(--radius-xl);
                    padding: 3rem;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                
                .teacher-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    z-index: 10;
                    gap: 2rem;
                }
                
                .teacher-header h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                    line-height: 1.2;
                }
                
                .teacher-header p {
                    font-size: 1.125rem;
                    opacity: 0.9;
                    max-width: 600px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }
                
                .main-content-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                /* Mobile Optimizations */
                @media (max-width: 1024px) {
                    .main-content-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .teacher-overview-container {
                        padding: 1.5rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .teacher-overview-container {
                        padding: 1rem;
                    }
                    
                    .teacher-header {
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                        border-radius: var(--radius-lg);
                    }
                    
                    .teacher-header-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    
                    .teacher-header h1 {
                        font-size: 1.75rem;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr; /* Stack vertically on small mobile */
                        gap: 1rem;
                    }
                }

                @media (min-width: 480px) and (max-width: 768px) {
                     .stats-grid {
                        grid-template-columns: repeat(2, 1fr); /* 2 columns on large phones/small tablets */
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="teacher-overview-container">
                {/* Header Section */}
                <div className="teacher-header">
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div className="teacher-header-content">
                            <div>
                                <h1>Bonjour, {user.full_name} 👋</h1>
                                <p>Bienvenue sur votre tableau de bord enseignant</p>
                            </div>
                            <Button
                                onClick={() => navigate('/teacher/quizzes/new')}
                                style={{
                                    padding: '0.875rem 1.75rem',
                                    backgroundColor: 'white',
                                    color: '#4F46E5',
                                    fontWeight: 600,
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <Plus size={20} style={{ marginRight: '0.5rem' }} />
                                Créer un nouveau quiz
                            </Button>
                        </div>
                    </div>

                    {/* Decorative background */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
                    }} />
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat) => (
                        <div key={stat.label} style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.75rem',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{
                                    padding: '0.875rem',
                                    borderRadius: '14px',
                                    backgroundColor: stat.bgColor,
                                    color: stat.color
                                }}>
                                    <stat.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                                    {stat.value}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {stat.trend === 'Excellent' ? <CheckCircle size={14} style={{ color: '#059669' }} /> :
                                        stat.trend === 'À améliorer' ? <AlertCircle size={14} style={{ color: '#D97706' }} /> : null}
                                    {stat.trend}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="main-content-grid">
                    {/* Recent Quizzes */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            padding: '1.75rem',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#FAFAFA',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ListChecks size={24} style={{ color: '#4F46E5' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Examens Récents</h3>
                            </div>
                            <Button variant="ghost" onClick={() => navigate('/teacher/quizzes')} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                <ArrowRight size={16} /> Voir tout
                            </Button>
                        </div>
                        <div>
                            {recentQuizzes.length > 0 ? recentQuizzes.map((quiz, index) => (
                                <div key={quiz.id} style={{
                                    padding: '1.5rem 1.75rem',
                                    borderBottom: index !== recentQuizzes.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.paddingLeft = '2rem';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.paddingLeft = '1.75rem';
                                    }}
                                    onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                                >
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <h4 style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                                            {quiz.title}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <BookOpen size={14} /> {quiz.questionCount} questions
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <UsersRound size={14} /> {quiz.class}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={14} /> {quiz.date}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.4rem 0.875rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: quiz.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                                        color: quiz.status === 'Active' ? '#059669' : '#DC2626',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {quiz.status === 'Active' ? '✓ Publié' : '○ Brouillon'}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <FileStack size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p style={{ fontWeight: 500 }}>Aucun examen récent</p>
                                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Créez votre premier quiz pour commencer</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Performance Insight */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.75rem',
                            color: 'white',
                            boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Trophy size={24} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Performance</h3>
                            </div>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem', opacity: 0.95 }}>
                                {stats[3]?.value === '0%'
                                    ? 'Créez votre premier examen pour voir les statistiques de performance.'
                                    : `Vos étudiants ont un taux de réussite moyen de ${stats[3]?.value}. ${parseInt(stats[3]?.value) >= 70 ? 'Excellent travail !' : 'Continuez à encourager vos élèves !'}`
                                }
                            </p>
                            <Button
                                style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onClick={() => navigate('/teacher/quizzes')}
                            >
                                <BarChart3 size={18} />
                                Voir les statistiques de réussite
                            </Button>
                        </div>

                        {/* Quick Actions Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.75rem',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text)' }}>
                                Actions Rapides
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/teacher/quizzes/new')}
                                    style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem' }}
                                    title="Créer un nouvel examen"
                                >
                                    <Plus size={18} />
                                    Créer un quiz
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/teacher/quizzes')}
                                    style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem' }}
                                    title="Gérer vos examens existants"
                                >
                                    <FileStack size={18} />
                                    Gérer les examens
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/teacher/results')}
                                    style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem', display: 'flex', gap: '0.75rem' }}
                                    title="Consulter les résultats détaillés"
                                >
                                    <BarChart3 size={18} />
                                    Voir les résultats
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Results Section */}
                {recentResults.length > 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            padding: '1.75rem',
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: '#FAFAFA'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ClipboardList size={24} style={{ color: '#4F46E5' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Résultats Récents</h3>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Étudiant</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Examen</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Résultat</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentResults.map((result, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{result.studentName}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-text-muted)' }}>{result.quizTitle}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                                    {result.score}/{result.totalScore}
                                                </span>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                                    ({result.percentage}%)
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.4rem 0.875rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: result.passed ? '#ECFDF5' : '#FEF2F2',
                                                    color: result.passed ? '#059669' : '#DC2626',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {result.passed ? '✓ Réussi' : '✗ Échoué'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                                {result.date}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/teacher/results/${result.id}`);
                                                    }}
                                                    title="Voir les détails"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
