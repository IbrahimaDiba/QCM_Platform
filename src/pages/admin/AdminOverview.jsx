import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { UserRound, BookOpen, University, Activity, Trophy, GraduationCap, ShieldCheck, PieChart, BarChart3, Users, RefreshCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminOverview() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch all counts
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('status', 'Active');
            const { count: resultCount } = await supabase.from('student_results').select('*', { count: 'exact', head: true });
            const { count: schoolCount } = await supabase.from('schools').select('*', { count: 'exact', head: true });

            // Fetch average score
            const { data: resultsData } = await supabase.from('student_results').select('percentage');
            const avgScore = resultsData && resultsData.length > 0
                ? Math.round(resultsData.reduce((sum, r) => sum + (r.percentage || 0), 0) / resultsData.length)
                : 0;

            setStats([
                {
                    label: 'Utilisateurs Totaux',
                    value: userCount?.toString() || '0',
                    icon: Users,
                    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    bgColor: '#eff6ff',
                    trend: '+12%',
                    trendPositive: true
                },
                {
                    label: 'Écoles',
                    value: schoolCount?.toString() || '0',
                    icon: University,
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    bgColor: '#f5f3ff',
                    trend: '+3',
                    trendPositive: true
                },
                {
                    label: 'Quiz Actifs',
                    value: quizCount?.toString() || '0',
                    icon: ShieldCheck,
                    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    bgColor: '#ecfeff',
                    trend: '+8',
                    trendPositive: true
                },
                {
                    label: 'Examens Passés',
                    value: resultCount?.toString() || '0',
                    icon: BookOpen,
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    bgColor: '#ecfdf5',
                    trend: '+24%',
                    trendPositive: true
                },
                {
                    label: 'Score Moyen',
                    value: `${avgScore}%`,
                    icon: Trophy,
                    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    bgColor: '#fffbeb',
                    trend: avgScore >= 70 ? 'Excellent' : avgScore >= 50 ? 'Bon' : 'À améliorer',
                    trendPositive: avgScore >= 50
                },
                {
                    label: 'Taux de Participation',
                    value: resultCount && quizCount ? `${Math.min(Math.round((resultCount / (quizCount * 10)) * 100), 100)}%` : '0%',
                    icon: PieChart,
                    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    bgColor: '#fdf2f8',
                    trend: 'Actif',
                    trendPositive: true
                },
            ]);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '1.125rem',
                color: 'var(--color-text-muted)'
            }}>
                Chargement du tableau de bord...
            </div>
        );
    }

    return (
        <div>
            {/* Header with gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2.5rem',
                color: 'white',
                boxShadow: '0 4px 20px rgba(30, 64, 175, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                            Tableau de Bord Administrateur
                        </h1>
                        <p style={{ fontSize: '0.95rem', opacity: 0.85, fontWeight: 300 }}>
                            Vue d'ensemble et statistiques de la plateforme
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)'
                    }}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        style={{
                            background: stat.bgColor,
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.75rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            animation: `fadeInUp 0.6s ease ${index * 0.08}s both`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                background: stat.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <stat.icon size={24} color="white" strokeWidth={2.5} />
                            </div>

                            <div style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '999px',
                                backgroundColor: stat.trendPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: stat.trendPositive ? '#059669' : '#dc2626'
                            }}>
                                {stat.trend}
                            </div>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.8125rem',
                                color: '#6b7280',
                                marginBottom: '0.5rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {stat.label}
                            </p>
                            <p style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: '#111827',
                                letterSpacing: '-0.025em',
                                lineHeight: 1
                            }}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>


            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
