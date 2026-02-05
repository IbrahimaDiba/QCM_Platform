import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Trash2, Eye, UserRound, BookOpen, ShieldAlert, GraduationCap, Clock, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminExams() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    profiles:teacher_id (
                        full_name,
                        email
                    ),
                    questions (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error) {
            console.error('Error fetching admin quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log('[AdminExams] handleDelete called with ID:', id);
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.')) {
            try {
                console.log('[AdminExams] Sending delete request to Supabase...');
                const { error } = await supabase.from('quizzes').delete().eq('id', id);
                if (error) {
                    console.error('[AdminExams] Supabase delete error:', error);
                    throw error;
                }
                console.log('[AdminExams] Delete successful, updating local state.');
                setQuizzes(quizzes.filter(q => q.id !== id));
            } catch (error) {
                console.error('[AdminExams] Exception caught:', error);
                alert('Erreur lors de la suppression: ' + error.message);
            }
        } else {
            console.log('[AdminExams] Deletion cancelled by user.');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div>
            <h1 className="t-h2" style={{ marginBottom: '2rem' }}>Gestion des Examens</h1>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {quizzes.map((quiz) => (
                    <Card key={quiz.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{quiz.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    <UserRound size={14} />
                                    <span>{quiz.profiles?.full_name || 'Professeur inconnu'}</span>
                                    <span>•</span>
                                    <GraduationCap size={14} />
                                    <span>{quiz.target_class}</span>
                                    <span>•</span>
                                    <Layers size={14} />
                                    <span>{quiz.questions?.[0]?.count || 0} Questions</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    backgroundColor: quiz.status === 'Active' ? 'var(--color-success)20' : 'var(--color-warning)20',
                                    color: quiz.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)'
                                }}>
                                    {quiz.status === 'Active' ? 'Publié' : 'Brouillon'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/exams/${quiz.id}`)}
                            >
                                <Eye size={16} style={{ marginRight: '0.5rem' }} />
                                Voir
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    console.log('Attempting to delete quiz:', quiz.id);
                                    handleDelete(quiz.id);
                                }}
                            >
                                <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                                Supprimer
                            </Button>
                        </div>
                    </Card>
                ))}

                {quizzes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        Aucun examen trouvé.
                    </div>
                )}
            </div>
        </div>
    );
}
