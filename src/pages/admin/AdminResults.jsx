import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Search, School, FileText, ChevronDown, ChevronRight, Globe, LayoutList, TrendingUp, Users, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminResults() {
    const [rawResults, setRawResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSchools, setExpandedSchools] = useState({});

    useEffect(() => {
        fetchGlobalResults();
    }, []);

    const fetchGlobalResults = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_results')
                .select(`
                    *,
                    profiles!student_id (full_name),
                    quizzes!quiz_id (
                        title,
                        establishment_id,
                        schools!establishment_id (name),
                        teacher:teacher_id (full_name)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRawResults(data || []);
        } catch (error) {
            console.error('Error fetching global results:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSchool = (schoolName) => {
        setExpandedSchools(prev => ({
            ...prev,
            [schoolName]: !prev[schoolName]
        }));
    };

    const groupedFilteredResults = React.useMemo(() => {
        const filtered = rawResults.filter(r =>
            r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.quizzes?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.quizzes?.schools?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const groups = {};
        filtered.forEach(result => {
            const schoolName = result.quizzes?.schools?.name || 'École Inconnue';
            const examTitle = result.quizzes?.title || 'Examen Inconnu';
            const teacherName = result.quizzes?.teacher?.full_name || 'Professeur inconnu';

            if (!groups[schoolName]) groups[schoolName] = {};
            if (!groups[schoolName][examTitle]) {
                groups[schoolName][examTitle] = {
                    teacher: teacherName,
                    results: []
                };
            }

            groups[schoolName][examTitle].results.push(result);
        });

        return groups;
    }, [rawResults, searchTerm]);

    if (loading) return <div style={{ padding: '2rem' }}>Chargement...</div>;

    const hasResults = Object.keys(groupedFilteredResults).length > 0;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Globe size={28} style={{ color: 'var(--color-primary)' }} />
                <h1 className="t-h2" style={{ margin: 0 }}>Résultats Globaux</h1>
            </div>

            <Card style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Rechercher par élève, école ou examen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '100%', background: 'transparent' }}
                />
            </Card>

            {!hasResults && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    Aucun résultat trouvé pour "{searchTerm}"
                </div>
            )}

            {Object.entries(groupedFilteredResults).map(([schoolName, exams]) => {
                const isExpanded = expandedSchools[schoolName];
                const resultCount = Object.values(exams).reduce((sum, examData) => sum + examData.results.length, 0);

                return (
                    <div key={schoolName} style={{ marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => toggleSchool(schoolName)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <School size={18} />
                                </div>
                                {schoolName}
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    opacity: 0.9,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem'
                                }}>
                                    <LayoutList size={14} />
                                    {resultCount} résultat{resultCount > 1 ? 's' : ''}
                                </span>
                            </span>
                            <span style={{
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.25rem'
                            }}>
                                <ChevronDown size={24} />
                            </span>
                        </button>

                        {isExpanded && (
                            <div style={{ marginTop: '1rem', marginLeft: '1rem' }}>
                                {Object.entries(exams).map(([examTitle, examData]) => (
                                    <div key={examTitle} style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={16} /> {examTitle}
                                            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                                (Prof: {examData.teacher})
                                            </span>
                                        </h3>
                                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                                                    <tr>
                                                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} /> Élève</div>
                                                        </th>
                                                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutList size={14} /> Score</div>
                                                        </th>
                                                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={14} /> Performance</div>
                                                        </th>
                                                        <th style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}><Calendar size={14} /> Date</div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {examData.results.map((result) => (
                                                        <tr key={result.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{result.profiles?.full_name}</td>
                                                            <td style={{ padding: '0.75rem 1rem' }}>{result.score}/{result.total_score}</td>
                                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <div style={{ flex: 1, height: '6px', backgroundColor: '#E5E7EB', borderRadius: '4px', maxWidth: '100px' }}>
                                                                        <div style={{
                                                                            width: `${result.percentage}%`,
                                                                            height: '100%',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: result.percentage >= 80 ? 'var(--color-success)' : result.percentage >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
                                                                        }} />
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{result.percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                                                {new Date(result.created_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
