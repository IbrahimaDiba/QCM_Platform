import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { BookOpen, Clock, ChevronRight, Mail } from 'lucide-react';
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
        console.log('StudentOverview: Fetching data for user:', user);
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
            console.log('StudentOverview: Teachers fetched:', data);
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

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div>
            <h1 className="t-h2" style={{ marginBottom: '2rem' }}>Examens Disponibles</h1>

            {quizzes.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                    <BookOpen size={24} />
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 500,
                                    padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)'
                                }}>
                                    {quiz.questions?.[0]?.count || 0} Questions
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{quiz.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', flex: 1, marginBottom: '1.5rem' }}>
                                {quiz.description || 'Aucune description fournie.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    <Clock size={16} />
                                    <span>{quiz.time_limit} min</span>
                                </div>

                                <Button onClick={() => navigate(`/student/quiz/${quiz.id}`)}>
                                    Commencer
                                    <ChevronRight size={16} style={{ marginLeft: '0.25rem' }} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '4rem' }}>
                    <BookOpen size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem auto', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Aucun examen disponible</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Revenez plus tard ou contactez vos professeurs pour plus d'informations.
                    </p>
                </Card>
            )}

            {/* Mes Professeurs Section */}
            <div style={{ marginTop: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="t-h2">Mes Professeurs</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/student/teachers')}>
                    Voir tout <ChevronRight size={16} />
                </Button>
            </div>

            {teachers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {teachers.map((teacher, index) => (
                        <Card key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1rem'
                            }}>
                                {teacher.full_name?.charAt(0) || 'P'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher.full_name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                    <Mail size={12} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacher.email}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Aucun professeur trouvé pour votre établissement.</p>
                </Card>
            )}
        </div>
    );
}
