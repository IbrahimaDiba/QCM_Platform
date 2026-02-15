import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Search, Filter, Download, Eye, TrendingUp, TrendingDown, Clock, Calendar, BookOpen, Users, CheckCircle, XCircle, ArrowRight, ClipboardCheck, Trophy, Target, FileSpreadsheet, AlertCircle, FileStack, UsersRound, BarChart2, BadgeCheck, FileSearch } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check for quiz filter in URL
    const queryParams = new URLSearchParams(location.search);
    const initialQuizFilter = queryParams.get('quizId') || 'all';

    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterQuiz, setFilterQuiz] = useState(initialQuizFilter);
    const [filterStatus, setFilterStatus] = useState('all');
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({
        totalResults: 0,
        averageScore: 0,
        passRate: 0,
        totalStudents: 0
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterQuiz, filterStatus, results]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch teacher's quizzes
            const { data: teacherQuizzes } = await supabase
                .from('quizzes')
                .select('id, title')
                .eq('teacher_id', user.id);

            setQuizzes(teacherQuizzes || []);
            const quizIds = teacherQuizzes?.map(q => q.id) || [];

            if (quizIds.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch results for teacher's quizzes
            const { data: resultsData } = await supabase
                .from('student_results')
                .select(`
                    *,
                    profiles!student_id (full_name, class_level),
                    quizzes!quiz_id (title, target_class)
                `)
                .in('quiz_id', quizIds)
                .order('created_at', { ascending: false });

            const formattedResults = resultsData?.map(r => ({
                id: r.id,
                studentName: r.profiles?.full_name || 'Étudiant inconnu',
                studentClass: r.profiles?.class_level || 'N/A',
                quizTitle: r.quizzes?.title || 'Quiz inconnu',
                quizClass: r.quizzes?.target_class || 'N/A',
                score: r.score,
                totalScore: r.total_score,
                percentage: r.percentage,
                passed: r.passed,
                duration: r.duration_taken,
                date: new Date(r.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                quizId: r.quiz_id,
                studentId: r.student_id
            })) || [];

            setResults(formattedResults);

            // Calculate stats
            const totalResults = formattedResults.length;
            const avgScore = totalResults > 0
                ? Math.round(formattedResults.reduce((acc, r) => acc + r.percentage, 0) / totalResults)
                : 0;
            const passRate = totalResults > 0
                ? Math.round((formattedResults.filter(r => r.passed).length / totalResults) * 100)
                : 0;
            const uniqueStudents = new Set(formattedResults.map(r => r.studentId)).size;

            setStats({
                totalResults,
                averageScore: avgScore,
                passRate,
                totalStudents: uniqueStudents
            });

        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...results];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Quiz filter
        if (filterQuiz !== 'all') {
            filtered = filtered.filter(r => String(r.quizId) === String(filterQuiz));
        }

        // Status filter
        if (filterStatus === 'passed') {
            filtered = filtered.filter(r => r.passed);
        } else if (filterStatus === 'failed') {
            filtered = filtered.filter(r => !r.passed);
        }

        setFilteredResults(filtered);
    };

    const exportToCSV = () => {
        const headers = ['Étudiant', 'Classe', 'Examen', 'Score', 'Pourcentage', 'Résultat', 'Durée', 'Date'];
        const rows = filteredResults.map(r => [
            r.studentName,
            r.studentClass,
            r.quizTitle,
            `${r.score}/${r.totalScore}`,
            `${r.percentage}%`,
            r.passed ? 'Réussi' : 'Échoué',
            r.duration,
            r.date
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `resultats_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
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
                <p style={{ color: 'var(--color-text-muted)' }}>Chargement des résultats...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .results-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    padding-bottom: 4rem;
                }
                
                .results-header {
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .results-header h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    color: var(--color-text);
                    line-height: 1.2;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }
                
                .stat-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: 1.75rem;
                    border: 1px solid var(--color-border);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                
                .filters-bar {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: 1.5rem;
                    border: 1px solid var(--color-border);
                    margin-bottom: 2rem;
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                }
                
                .search-input {
                    flex: 1;
                    min-width: 300px;
                    padding: 0.875rem 1rem;
                    padding-left: 2.75rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-border);
                    font-size: 0.95rem;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .results-table-container {
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--color-border);
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                
                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 900px;
                }
                
                .results-table thead {
                    background: #F9FAFB;
                    border-bottom: 1px solid var(--color-border);
                }
                
                .results-table th {
                    padding: 1.25rem 1.5rem;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .results-table tbody tr {
                    border-bottom: 1px solid var(--color-border);
                    transition: background 0.2s;
                }
                
                .results-table tbody tr:hover {
                    background: #F9FAFB;
                }
                
                .results-table td {
                    padding: 1.25rem 1.5rem;
                    font-size: 0.95rem;
                }
                
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.875rem;
                    border-radius: var(--radius-full);
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }
                
                .status-badge.passed {
                    background: #ECFDF5;
                    color: #059669;
                    border: 1px solid #A7F3D0;
                }
                
                .status-badge.failed {
                    background: #FEF2F2;
                    color: #DC2626;
                    border: 1px solid #FECACA;
                }
                
                .score-display {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .score-number {
                    font-weight: 700;
                    font-size: 1rem;
                    min-width: 3.5rem;
                }
                
                .score-bar {
                    flex: 1;
                    height: 8px;
                    background: #F3F4F6;
                    border-radius: var(--radius-full);
                    overflow: hidden;
                    min-width: 80px;
                }
                
                .score-fill {
                    height: 100%;
                    border-radius: var(--radius-full);
                    transition: width 1s ease-out;
                }
                
                @media (max-width: 1024px) {
                    .results-container {
                        padding: 1.5rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .results-container {
                        padding: 1rem;
                    }
                    
                    .results-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }

                    .results-header h1 {
                         font-size: 1.75rem;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .filters-bar {
                        padding: 1rem;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    
                    .search-input {
                        min-width: 100%;
                    }
                    
                    /* Hide less important columns if needed, but horizontal scroll is often better for data tables */
                    /* .results-table-container { overflow-x: auto; } is already set */
                }

                @media (min-width: 480px) and (max-width: 768px) {
                     .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="results-container">
                {/* Header */}
                <div className="results-header">
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Résultats des Examens
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
                        Consultez les performances de vos étudiants
                    </p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '0.875rem',
                                borderRadius: '14px',
                                backgroundColor: '#EEF2FF',
                                color: '#4F46E5'
                            }}>
                                <FileStack size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem' }}>
                            {stats.totalResults}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Total Résultats
                        </p>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '0.875rem',
                                borderRadius: '14px',
                                backgroundColor: '#F0F9FF',
                                color: '#0EA5E9'
                            }}>
                                <UsersRound size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem' }}>
                            {stats.totalStudents}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Étudiants Uniques
                        </p>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '0.875rem',
                                borderRadius: '14px',
                                backgroundColor: stats.averageScore >= 70 ? '#ECFDF5' : '#FFFBEB',
                                color: stats.averageScore >= 70 ? '#059669' : '#D97706'
                            }}>
                                <BarChart2 size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem' }}>
                            {stats.averageScore}%
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Score Moyen
                        </p>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '0.875rem',
                                borderRadius: '14px',
                                backgroundColor: stats.passRate >= 70 ? '#ECFDF5' : '#FEF2F2',
                                color: stats.passRate >= 70 ? '#059669' : '#DC2626'
                            }}>
                                <BadgeCheck size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.5rem' }}>
                            {stats.passRate}%
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Taux de Réussite
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={20} style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)'
                        }} />
                        <input
                            type="text"
                            placeholder="Rechercher par étudiant ou examen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <select
                        value={filterQuiz}
                        onChange={(e) => setFilterQuiz(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid var(--color-border)',
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            minWidth: '200px'
                        }}
                    >
                        <option value="all">Tous les examens</option>
                        {quizzes.map(quiz => (
                            <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid var(--color-border)',
                            fontSize: '1rem',
                            backgroundColor: 'white',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="passed">Réussi</option>
                        <option value="failed">Échoué</option>
                    </select>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                            variant="outline"
                            onClick={exportToCSV}
                            disabled={filteredResults.length === 0}
                            style={{
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FileSpreadsheet size={18} />
                            Exporter CSV
                        </Button>
                    </div>
                </div>

                {/* Results Table */}
                {filteredResults.length > 0 ? (
                    <div className="results-table-container">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Étudiant</th>
                                        <th>Classe</th>
                                        <th>Examen</th>
                                        <th>Score</th>
                                        <th>Pourcentage</th>
                                        <th>Résultat</th>
                                        <th>Durée</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map((result) => (
                                        <tr key={result.id}>
                                            <td style={{ fontWeight: 600 }}>{result.studentName}</td>
                                            <td style={{ color: 'var(--color-text-muted)' }}>{result.studentClass}</td>
                                            <td>{result.quizTitle}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                                    {result.score}/{result.totalScore}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="score-display">
                                                    <span className="score-number">{result.percentage}%</span>
                                                    <div className="score-bar">
                                                        <div
                                                            className="score-fill"
                                                            style={{
                                                                width: `${result.percentage}%`,
                                                                background: result.percentage >= 70
                                                                    ? 'linear-gradient(90deg, #059669, #34D399)'
                                                                    : result.percentage >= 50
                                                                        ? 'linear-gradient(90deg, #D97706, #FBBF24)'
                                                                        : 'linear-gradient(90deg, #DC2626, #F87171)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${result.passed ? 'passed' : 'failed'}`}>
                                                    {result.passed ? (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            Réussi
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={16} />
                                                            Échoué
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)' }}>{result.duration}</td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                                {result.date}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/teacher/results/${result.id}`)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem'
                                                    }}
                                                >
                                                    <FileSearch size={14} />
                                                    Détails
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: 'white',
                        borderRadius: 'var(--radius-xl)',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)'
                    }}>
                        <AlertCircle size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3, color: 'var(--color-text-muted)' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Aucun résultat trouvé
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {results.length === 0
                                ? "Aucun étudiant n'a encore passé vos examens."
                                : "Aucun résultat ne correspond à vos critères de recherche."
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
