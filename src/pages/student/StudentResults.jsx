import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Award, Calendar, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentResults() {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchResults();
        }
    }, [user]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_results')
                .select(`
                    *,
                    quizzes (title)
                `)
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setResults(data.map(r => ({
                id: r.id,
                quizTitle: r.quizzes?.title || 'Examen inconnu',
                score: r.score,
                total: r.total_score,
                percentage: r.percentage,
                date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: r.duration_taken,
                passed: r.passed
            })));
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Chargement de vos résultats...</div>;

    const averageScore = results.length > 0
        ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
        : 0;
    const totalTests = results.length;
    const successRate = totalTests > 0
        ? Math.round((results.filter(r => r.passed).length / totalTests) * 100)
        : 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header Section */}
            <div style={{
                marginBottom: '3rem',
                backgroundColor: '#1E1B4B',
                borderRadius: 'var(--radius-xl)',
                padding: '3rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 className="t-h1" style={{ color: 'white', marginBottom: '0.5rem' }}>Mes Résultats</h1>
                    <p style={{ color: '#A5B4FC', fontSize: '1.125rem', maxWidth: '600px' }}>
                        Consultez l'historique de vos examens et suivez votre progression académique.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{averageScore}%</span>
                            <span style={{ color: '#A5B4FC', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Moyenne</span>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#312E81' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{totalTests}</span>
                            <span style={{ color: '#A5B4FC', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Examens</span>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#312E81' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{successRate}%</span>
                            <span style={{ color: '#A5B4FC', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Réussite</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(30, 27, 75, 0) 70%)'
                }} />
            </div>

            {/* Grid Layout */}
            <h2 className="t-h3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={24} style={{ color: 'var(--color-primary)' }} />
                Historique Récent
            </h2>

            {results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {results.map((result) => (
                        <div key={result.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                cursor: 'default',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                            }}
                        >
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: result.passed ? '#ECFDF5' : '#FEF2F2',
                                        color: result.passed ? '#059669' : '#DC2626',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {result.passed ? 'Validé' : 'Non validé'}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} />
                                        {result.date}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                                    {result.quizTitle}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                                    <Clock size={14} />
                                    Durée: {result.time}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>Score</span>
                                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                            {result.score}
                                            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/{result.total}</span>
                                        </span>
                                    </div>
                                    <div style={{ width: '60px', height: '60px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#E5E7EB"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke={result.passed ? 'var(--color-success)' : 'var(--color-danger)'}
                                                strokeWidth="3"
                                                strokeDasharray={`${result.percentage}, 100`}
                                            />
                                        </svg>
                                        <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 700, color: result.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                            {result.percentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                height: '6px',
                                background: result.passed ? 'linear-gradient(90deg, var(--color-success), #34D399)' : 'linear-gradient(90deg, var(--color-danger), #F87171)'
                            }} />
                        </div>
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '4rem' }}>
                    <TrendingUp size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem auto', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Aucun résultat</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Vous n'avez pas encore passé d'examen.
                    </p>
                </Card>
            )}
        </div>
    );
}

