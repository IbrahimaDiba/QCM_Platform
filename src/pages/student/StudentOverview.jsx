import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { BookOpen, Clock, ChevronRight, Mail, Calendar, Lock, User, GraduationCap, ArrowRight, FileText, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentOverview() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchQuizzes(), fetchTeachers()]);
        setLoading(false);
    };

    const fetchTeachers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('role', 'teacher')
                .eq('school_id', user.school_id)
                .limit(4);

            if (error) throw error;
            setTeachers(data || []);
        } catch (error) {
            console.error('StudentOverview: Error fetching teachers:', error);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    questions (count)
                `)
                .eq('target_class', user.class_level)
                .eq('establishment_id', user.school_id)
                .eq('status', 'Active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // Get Greeting based on time
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('fr-FR', dateOptions);

    return (
        <div style={{ paddingBottom: '4rem', fontFamily: '"Inter", sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                .welcome-banner {
                    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                    border-radius: 1.5rem;
                    padding: 3rem 2rem;
                    color: white;
                    margin-bottom: 3rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
                }
                
                .welcome-pattern {
                    position: absolute;
                    top: 0; right: 0; bottom: 0; left: 0;
                    opacity: 0.1;
                    background-image: radial-gradient(#fff 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                
                .quiz-card {
                    background: white;
                    border-radius: 1.25rem;
                    border: 1px solid #F3F4F6;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                
                .quiz-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08);
                    border-color: #C7D2FE;
                }
                
                .quiz-card.expired {
                    opacity: 0.7;
                    background: #F9FAFB;
                }

                .teacher-card {
                    background: white;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    border: 1px solid #F3F4F6;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .teacher-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #6366F1, #EC4899, #10B981, #F59E0B);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .teacher-card:hover {
                    transform: translateY(-4px);
                    border-color: #C7D2FE;
                    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08);
                }
                
                .teacher-card:hover::before {
                    opacity: 1;
                }
            `}</style>

            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-pattern"></div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                        {today}
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
                        Bonjour {user.user_metadata?.full_name || user.user_metadata?.first_name || 'Étudiant'} ! 👋
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.5 }}>
                        Vous avez <strong style={{ color: '#FCD34D' }}>{quizzes.filter(q => {
                            const now = new Date();
                            const start = q.start_time ? new Date(q.start_time) : null;
                            const end = q.end_time ? new Date(q.end_time) : null;
                            return (!start || now >= start) && (!end || now <= end);
                        }).length} examens actifs</strong> aujourd'hui. Prêt à relever le défi ?
                    </p>
                </div>
                <div style={{
                    position: 'absolute', right: '2rem', bottom: '-1rem', opacity: 0.2,
                    transform: 'rotate(-10deg) scale(1.5)', pointerEvents: 'none'
                }}>
                    <BookOpen size={180} />
                </div>
            </div>

            {/* Quizzes Section */}
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#EEF2FF', padding: '0.5rem', borderRadius: '10px', color: '#4F46E5' }}>
                            <GraduationCap size={24} />
                        </div>
                        Examens Disponibles
                    </h2>
                </div>

                {quizzes.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {quizzes.map((quiz) => {
                            const now = new Date();
                            const startDate = quiz.start_time ? new Date(quiz.start_time) : null;
                            const endDate = quiz.end_time ? new Date(quiz.end_time) : null;

                            const isUpcoming = startDate && now < startDate;
                            const isExpired = endDate && now > endDate;
                            const isActive = !isUpcoming && !isExpired;

                            let statusConfig = { label: 'Disponible', color: '#059669', bg: '#ECFDF5', icon: Lock };
                            if (isUpcoming) statusConfig = { label: 'À venir', color: '#D97706', bg: '#FFFBEB', icon: Calendar };
                            if (isExpired) statusConfig = { label: 'Terminé', color: '#DC2626', bg: '#FEF2F2', icon: Lock };
                            if (isActive) statusConfig.icon = ChevronRight;

                            return (
                                <div key={quiz.id} className={`quiz-card ${isExpired ? 'expired' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{
                                            background: isActive ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : `linear-gradient(135deg, ${statusConfig.color} 0%, ${statusConfig.color}DD 100%)`,
                                            color: 'white',
                                            padding: '0.875rem', borderRadius: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.25)' : `0 4px 12px ${statusConfig.color}40`
                                        }}>
                                            <ClipboardList size={26} strokeWidth={2} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            padding: '0.35rem 0.75rem', borderRadius: '9999px',
                                            background: statusConfig.bg, color: statusConfig.color,
                                            border: `1px solid ${statusConfig.color}40`
                                        }}>
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                                        {quiz.title}
                                    </h3>
                                    <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                                        {quiz.description || 'Aucune description disponible pour cet examen.'}
                                    </p>

                                    {/* Availability Info */}
                                    {(startDate || endDate) && (
                                        <div style={{
                                            background: '#F9FAFB', borderRadius: '8px', padding: '0.75rem',
                                            marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4B5563',
                                            display: 'flex', flexDirection: 'column', gap: '0.4rem'
                                        }}>
                                            {startDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={14} style={{ color: '#6B7280' }} />
                                                    <span>Début: <span style={{ fontWeight: 500 }}>{startDate.toLocaleString('fr-FR')}</span></span>
                                                </div>
                                            )}
                                            {endDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={14} style={{ color: '#6B7280' }} />
                                                    <span>Fin: <span style={{ fontWeight: 500 }}>{endDate.toLocaleString('fr-FR')}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <Clock size={16} />
                                            {quiz.time_limit} min
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>
                                            <span style={{ width: '4px', height: '4px', background: '#D1D5DB', borderRadius: '50%' }}></span>
                                            {quiz.questions?.[0]?.count || 0} Questions
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                        disabled={!isActive}
                                        style={{
                                            marginTop: '1.25rem',
                                            width: '100%',
                                            justifyContent: 'center',
                                            padding: '0.875rem',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            background: isActive ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : '#E5E7EB',
                                            color: isActive ? 'white' : '#9CA3AF',
                                            cursor: isActive ? 'pointer' : 'not-allowed',
                                            opacity: isActive ? 1 : 0.8,
                                            border: 'none',
                                            boxShadow: isActive ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                                        }}
                                    >
                                        {isActive ? 'Commencer l\'examen' : (isUpcoming ? 'Bientôt disponible' : 'Examen terminé')}
                                        <statusConfig.icon size={18} style={{ marginLeft: '0.5rem' }} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '1.5rem',
                        border: '1px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ background: '#F3F4F6', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <BookOpen size={40} style={{ color: '#9CA3AF' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Aucun examen disponible</h3>
                        <p style={{ color: '#6B7280', maxWidth: '400px', lineHeight: 1.5 }}>
                            Il n'y a pas d'examens actifs pour le moment. Profitez-en pour réviser vos cours ! 📚
                        </p>
                    </div>
                )}
            </div>

            {/* Professors Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#F3E8FF', padding: '0.5rem', borderRadius: '10px', color: '#7C3AED' }}>
                            <User size={22} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Vos Professeurs</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/student/teachers')} style={{ fontSize: '0.875rem', color: 'white', backgroundColor: '#4F46E5', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
                        Voir tout <ArrowRight size={16} />
                    </Button>
                </div>

                {teachers.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                        {teachers.map((teacher, index) => {
                            const gradients = [
                                { from: '#6366F1', to: '#4338CA', shadow: 'rgba(99, 102, 241, 0.3)' },
                                { from: '#EC4899', to: '#BE185D', shadow: 'rgba(236, 72, 153, 0.3)' },
                                { from: '#10B981', to: '#047857', shadow: 'rgba(16, 185, 129, 0.3)' },
                                { from: '#F59E0B', to: '#B45309', shadow: 'rgba(245, 158, 11, 0.3)' }
                            ];
                            const gradient = gradients[index % 4];

                            return (
                                <div key={index} className="teacher-card">
                                    <div style={{
                                        width: '80px', height: '80px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                                        color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '2rem',
                                        boxShadow: `0 8px 16px ${gradient.shadow}`,
                                        marginBottom: '1rem',
                                        border: '4px solid white'
                                    }}>
                                        {teacher.full_name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
                                        {teacher.full_name}
                                    </h3>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        color: '#6B7280', fontSize: '0.875rem',
                                        background: '#F9FAFB', padding: '0.5rem 1rem',
                                        borderRadius: '9999px', border: '1px solid #E5E7EB'
                                    }}>
                                        <Mail size={14} />
                                        <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {teacher.email}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#F9FAFB', borderRadius: '1rem', border: '1px solid #F3F4F6' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Aucun professeur trouvé pour votre établissement.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
