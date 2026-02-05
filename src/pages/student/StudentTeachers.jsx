import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Users, Mail, School } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentTeachers() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTeachers();
        }
    }, [user]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            // Fetch teachers from the same school
            // Note: RLS must allow students to read basic info of teachers in their school
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, school_id')
                .eq('role', 'teacher')
                .eq('school_id', user.school_id);

            if (error) throw error;
            setTeachers(data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            // alert('Impossible de charger la liste des professeurs.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    return (
        <div>
            <h1 className="t-h2" style={{ marginBottom: '2rem' }}>Mes Professeurs</h1>

            {teachers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {teachers.map((teacher, index) => (
                        <Card key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '50px', height: '50px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1.25rem'
                            }}>
                                {teacher.full_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{teacher.full_name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    <Mail size={14} />
                                    <span>{teacher.email}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <Users size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem auto', opacity: 0.5 }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>Aucun professeur trouvé pour votre établissement.</p>
                </Card>
            )}
        </div>
    );
}
