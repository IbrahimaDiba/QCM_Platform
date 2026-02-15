import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { UserRound, BookOpen, University, Activity, Trophy, GraduationCap, ShieldCheck, PieChart, BarChart3, Users, RefreshCcw, Plus, FileText, TrendingUp, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminOverview() {
    const navigate = useNavigate();
    const { user } = useAuth();
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
                    number: '01',
                    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    bgColor: '#EEF2FF',
                    shadowColor: 'rgba(79, 70, 229, 0.3)',
                    trend: '+12%',
                    trendPositive: true
                },
                {
                    label: 'Écoles',
                    value: schoolCount?.toString() || '0',
                    number: '02',
                    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                    bgColor: '#FDF2F8',
                    shadowColor: 'rgba(236, 72, 153, 0.3)',
                    trend: '+3',
                    trendPositive: true
                },
                {
                    label: 'Quiz Actifs',
                    value: quizCount?.toString() || '0',
                    number: '03',
                    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    bgColor: '#ECFEFF',
                    shadowColor: 'rgba(6, 182, 212, 0.3)',
                    trend: '+8',
                    trendPositive: true
                },
                {
                    label: 'Examens Passés',
                    value: resultCount?.toString() || '0',
                    number: '04',
                    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    bgColor: '#ECFDF5',
                    shadowColor: 'rgba(16, 185, 129, 0.3)',
                    trend: '+24%',
                    trendPositive: true
                },
                {
                    label: 'Score Moyen',
                    value: `${avgScore}%`,
                    number: '05',
                    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    bgColor: '#FFFBEB',
                    shadowColor: 'rgba(245, 158, 11, 0.3)',
                    trend: avgScore >= 70 ? 'Excellent' : avgScore >= 50 ? 'Bon' : 'À améliorer',
                    trendPositive: avgScore >= 50
                },
                {
                    label: 'Taux de Participation',
                    value: resultCount && quizCount ? `${Math.min(Math.round((resultCount / (quizCount * 10)) * 100), 100)}%` : '0%',
                    number: '06',
                    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    bgColor: '#F3E8FF',
                    shadowColor: 'rgba(139, 92, 246, 0.3)',
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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
                }}></div>
                <p style={{ color: '#6B7280', fontSize: '1rem' }}>Chargement du tableau de bord...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '3rem' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
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
                
                .admin-stat-card {
                    background: white;
                    border-radius: 1.25rem;
                    padding: 2rem;
                    border: 1px solid #F3F4F6;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .admin-stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .admin-stat-card:hover {
                    transform: translateY(-8px);
                    border-color: #E5E7EB;
                }
                
                .admin-stat-card:hover::before {
                    opacity: 1;
                }
                
                .quick-action-btn {
                    background: white;
                    border: 1px solid #E5E7EB;
                    padding: 1rem 1.5rem;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    font-weight: 600;
                    color: #374151;
                }
                
                .quick-action-btn:hover {
                    background: #F9FAFB;
                    border-color: #D1D5DB;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
            `}</style>

            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '1.5rem',
                padding: '3rem 2.5rem',
                marginBottom: '3rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Shield size={28} />
                            </div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
                                {greeting}, Administrateur ! 👋
                            </h1>
                        </div>
                        <p style={{ fontSize: '1.125rem', opacity: 0.9, margin: 0, fontWeight: 400 }}>
                            Vue d'ensemble et statistiques de la plateforme
                        </p>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textTransform: 'capitalize'
                    }}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="admin-stat-card"
                        style={{
                            animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                            boxShadow: `0 4px 6px -1px ${stat.shadowColor}`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 20px 25px -5px ${stat.shadowColor}`;
                            e.currentTarget.querySelector('.stat-icon').style.transform = 'scale(1.1) rotate(5deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 6px -1px ${stat.shadowColor}`;
                            e.currentTarget.querySelector('.stat-icon').style.transform = 'scale(1) rotate(0deg)';
                        }}
                    >
                        <div style={{ background: stat.gradient }} className="admin-stat-card-border"></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div
                                className="stat-icon"
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: stat.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 16px ${stat.shadowColor}`,
                                    transition: 'transform 0.3s ease',
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: 'white',
                                    letterSpacing: '-0.025em'
                                }}
                            >
                                {stat.number}
                            </div>

                            <div style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                background: stat.trendPositive
                                    ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                                    : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: stat.trendPositive ? '#059669' : '#DC2626',
                                border: `1px solid ${stat.trendPositive ? '#A7F3D0' : '#FECACA'}`
                            }}>
                                {stat.trend}
                            </div>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#6B7280',
                                marginBottom: '0.5rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {stat.label}
                            </p>
                            <p style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: '#111827',
                                letterSpacing: '-0.025em',
                                lineHeight: 1,
                                margin: 0
                            }}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
                    Actions Rapides
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button className="quick-action-btn" onClick={() => navigate('/admin/schools')}>
                        <Plus size={20} style={{ color: '#4F46E5' }} />
                        <span>Ajouter École</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/admin/users')}>
                        <Users size={20} style={{ color: '#EC4899' }} />
                        <span>Gérer Utilisateurs</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/admin/results')}>
                        <BarChart3 size={20} style={{ color: '#10B981' }} />
                        <span>Voir Rapports</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => fetchStats()}>
                        <RefreshCcw size={20} style={{ color: '#F59E0B' }} />
                        <span>Actualiser</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
