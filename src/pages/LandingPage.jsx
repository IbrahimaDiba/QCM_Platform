import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, UserCheck, Timer, TrendingUp, Lock } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            icon: UserCheck,
            title: 'Gestion Multi-Rôles',
            description: 'Interface dédiée pour Administrateurs, Enseignants et Étudiants avec permissions adaptées.'
        },
        {
            icon: Timer,
            title: 'Examens Chronométrés',
            description: 'Configurez des durées personnalisées pour chaque évaluation avec compte à rebours automatique.'
        },
        {
            icon: TrendingUp,
            title: 'Analyse des Performances',
            description: 'Tableaux de bord détaillés et statistiques en temps réel pour suivre la progression.'
        },
        {
            icon: Lock,
            title: 'Sécurité Renforcée',
            description: 'Authentification robuste et contrôle d\'accès basé sur les rôles pour protéger vos données.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
            <style>{`
                /* Global Landing Styles */
                .landing-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--color-border);
                    background-color: var(--color-surface);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }
                
                .landing-header-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .landing-header-buttons {
                    display: flex;
                    gap: 1rem;
                }
                
                .landing-hero {
                    padding: 8rem 2rem 6rem;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                
                .landing-hero-container {
                    max-width: 900px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 10;
                }
                
                .landing-hero h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }
                
                .landing-hero p {
                    font-size: 1.25rem;
                    margin-bottom: 3rem;
                    opacity: 0.95;
                    line-height: 1.6;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .landing-hero-cta {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .landing-features {
                    padding: 6rem 2rem;
                    background: var(--color-background);
                }
                
                .landing-features-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .landing-features h2 {
                    text-align: center;
                    margin-bottom: 4rem;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: var(--color-text);
                }
                
                .landing-features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2.5rem;
                }
                
                .landing-feature-card {
                    text-align: center;
                    padding: 2.5rem 2rem;
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--color-border);
                    cursor: default;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .landing-feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: #667eea;
                }
                
                .landing-footer {
                    background-color: #1F2937;
                    color: #D1D5DB;
                    padding: 4rem 2rem 2rem;
                }
                
                /* Mobile Optimizations */
                @media (max-width: 1024px) {
                    .landing-hero { padding-top: 6rem; }
                    .landing-hero h1 { font-size: 3rem; }
                }
                
                @media (max-width: 768px) {
                    .landing-header {
                        padding: 1rem 1.25rem;
                    }
                    
                    .landing-header-logo h1 {
                        font-size: 1.25rem;
                    }
                    
                    .landing-header-logo svg {
                        width: 28px;
                        height: 28px;
                    }
                    
                    .landing-header-buttons {
                        gap: 0.5rem;
                    }
                    
                    .landing-hero {
                        padding: 4rem 1.5rem;
                    }
                    
                    .landing-hero h1 {
                        font-size: 2.25rem;
                    }
                    
                    .landing-hero p {
                        font-size: 1.125rem;
                        margin-bottom: 2rem;
                    }
                    
                    .landing-features {
                        padding: 4rem 1.5rem;
                    }
                    
                    .landing-features h2 {
                        font-size: 2rem;
                        margin-bottom: 2.5rem;
                    }
                    
                    .landing-features-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    
                    .landing-feature-card {
                        padding: 2rem 1.5rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .landing-header {
                        padding: 1rem;
                    }
                    
                    .landing-header-buttons button {
                        padding: 0.5rem 0.875rem;
                        font-size: 0.875rem;
                    }
                    
                    .landing-hero h1 {
                        font-size: 1.875rem;
                    }
                    
                    .landing-hero-cta button {
                        width: 100%;
                        max-width: 320px;
                    }
                    
                    .landing-features {
                        padding: 3rem 1rem;
                    }
                }
            `}</style>

            {/* Header */}
            <header className="landing-header">
                <div className="landing-header-logo">
                    <GraduationCap size={32} style={{ color: 'var(--color-primary)' }} />
                    <h1 className="t-h2" style={{ color: 'var(--color-primary)', margin: 0 }}>QCM App</h1>
                </div>
                <div className="landing-header-buttons">
                    <Button variant="outline" onClick={() => navigate('/login')}>
                        Se connecter
                    </Button>
                    <Button onClick={() => navigate('/register')}>
                        S'inscrire
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-container">
                    <h1>
                        Plateforme d'Examens en Ligne
                    </h1>
                    <p>
                        Créez, gérez et passez des examens QCM facilement.
                        Une solution complète pour les écoles modernes, conçue pour la réussite.
                    </p>
                    <div className="landing-hero-cta">
                        <Button
                            onClick={() => navigate('/login')}
                            style={{
                                backgroundColor: 'white',
                                color: 'var(--color-primary)',
                                padding: '1rem 2.5rem',
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-full)',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            Commencer Maintenant
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <div className="landing-features-container">
                    <h2>
                        Fonctionnalités Principales
                    </h2>
                    <div className="landing-features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="landing-feature-card"
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: `${['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B'][index]}15`,
                                    color: ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B'][index],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto'
                                }}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '5rem 2rem',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)'
            }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                        Prêt à commencer ?
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
                        Rejoignez des milliers d'écoles qui utilisent QCM App pour leurs examens.
                    </p>
                    <Button
                        onClick={() => navigate('/login')}
                        style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}
                    >
                        Accéder à la plateforme
                    </Button>
                </div>
            </section>


            {/* Footer */}
            <footer className="landing-footer">
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '3rem',
                        marginBottom: '3rem'
                    }}>
                        {/* About Section */}
                        <div style={{ gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <GraduationCap size={28} style={{ color: '#818CF8' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>QCM App</h3>
                            </div>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#9CA3AF' }}>
                                Plateforme moderne d'examens en ligne pour les établissements scolaires. Simple, rapide et sécurisée.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white' }}>
                                Liens Rapides
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                                <li>
                                    <a href="/login" style={{ fontSize: '0.95rem', color: '#9CA3AF', transition: 'color 0.2s', textDecoration: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#818CF8'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                                        Se connecter
                                    </a>
                                </li>
                                <li>
                                    <a href="#features" style={{ fontSize: '0.95rem', color: '#9CA3AF', transition: 'color 0.2s', textDecoration: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#818CF8'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                                        Fonctionnalités
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white' }}>
                                Support
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                                <li style={{ fontSize: '0.95rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Email: support@qcmapp.com
                                </li>
                                <li style={{ fontSize: '0.95rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Tél: 77 232 70 57
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'white' }}>
                                Légal
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                                <li>
                                    <a href="#" style={{ fontSize: '0.95rem', color: '#9CA3AF', transition: 'color 0.2s', textDecoration: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#818CF8'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                                        Mentions légales
                                    </a>
                                </li>
                                <li>
                                    <a href="#" style={{ fontSize: '0.95rem', color: '#9CA3AF', transition: 'color 0.2s', textDecoration: 'none' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#818CF8'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}>
                                        Confidentialité
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div style={{
                        borderTop: '1px solid #374151',
                        paddingTop: '2rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                            © 2026 QCM App. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
