import React, { useState, useEffect } from 'react';
import { Users, Mail, User } from 'lucide-react';
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
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, school_id')
                .eq('role', 'teacher')
                .eq('school_id', user.school_id);

            if (error) throw error;
            setTeachers(data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', paddingBottom: '3rem' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                .teacher-card-full {
                    background: white;
                    border-radius: 1.25rem;
                    padding: 2rem;
                    border: 1px solid #F3F4F6;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .teacher-card-full::before {
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
                
                .teacher-card-full:hover {
                    transform: translateY(-6px);
                    border-color: #C7D2FE;
                    box-shadow: 0 16px 32px -6px rgba(0, 0, 0, 0.1);
                }
                
                .teacher-card-full:hover::before {
                    opacity: 1;
                }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#F3E8FF', padding: '0.75rem', borderRadius: '12px', color: '#7C3AED' }}>
                        <Users size={28} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Mes Professeurs
                    </h1>
                </div>
                <p style={{ color: '#6B7280', fontSize: '1rem', marginLeft: '4.5rem' }}>
                    Tous les enseignants de votre établissement
                </p>
            </div>

            {teachers.length > 0 ? (
                <>
                    <div style={{
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 100%)',
                        padding: '1rem 1.5rem',
                        borderRadius: '1rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        border: '1px solid #E0E7FF'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            color: '#4F46E5',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            minWidth: '40px',
                            textAlign: 'center'
                        }}>
                            {teachers.length}
                        </div>
                        <span style={{ color: '#4338CA', fontWeight: 600 }}>
                            {teachers.length === 1 ? 'Professeur disponible' : 'Professeurs disponibles'}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                        {teachers.map((teacher, index) => {
                            const gradients = [
                                { from: '#6366F1', to: '#4338CA', shadow: 'rgba(99, 102, 241, 0.3)' },
                                { from: '#EC4899', to: '#BE185D', shadow: 'rgba(236, 72, 153, 0.3)' },
                                { from: '#10B981', to: '#047857', shadow: 'rgba(16, 185, 129, 0.3)' },
                                { from: '#F59E0B', to: '#B45309', shadow: 'rgba(245, 158, 11, 0.3)' },
                                { from: '#8B5CF6', to: '#6D28D9', shadow: 'rgba(139, 92, 246, 0.3)' },
                                { from: '#EF4444', to: '#B91C1C', shadow: 'rgba(239, 68, 68, 0.3)' }
                            ];
                            const gradient = gradients[index % 6];

                            return (
                                <div key={index} className="teacher-card-full">
                                    <div style={{
                                        width: '100px', height: '100px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                                        color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '2.5rem',
                                        boxShadow: `0 10px 20px ${gradient.shadow}`,
                                        marginBottom: '1.5rem',
                                        border: '5px solid white'
                                    }}>
                                        {teacher.full_name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', margin: '0 0 1rem 0' }}>
                                        {teacher.full_name}
                                    </h3>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        color: '#6B7280', fontSize: '0.875rem',
                                        background: '#F9FAFB', padding: '0.625rem 1.25rem',
                                        borderRadius: '9999px', border: '1px solid #E5E7EB',
                                        maxWidth: '100%'
                                    }}>
                                        <Mail size={14} />
                                        <span style={{ wordBreak: 'break-all' }}>
                                            {teacher.email}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div style={{
                    textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1.5rem',
                    border: '1px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <div style={{ background: '#F3F4F6', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
                        <Users size={48} style={{ color: '#9CA3AF' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
                        Aucun professeur trouvé
                    </h3>
                    <p style={{ color: '#6B7280', maxWidth: '400px', lineHeight: 1.5 }}>
                        Il n'y a pas de professeurs enregistrés pour votre établissement.
                    </p>
                </div>
            )}
        </div>
    );
}
