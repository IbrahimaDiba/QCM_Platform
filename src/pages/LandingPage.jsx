import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, UserCheck, Timer, TrendingUp, Lock, ArrowRight, CheckCircle, Users, FileCheck, School } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/${user.role}`);
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            icon: UserCheck,
            title: 'Gestion Multi-Rôles',
            description: 'Interface dédiée pour Administrateurs, Enseignants et Étudiants avec permissions adaptées.',
            color: '#4F46E5',
            bg: '#EEF2FF'
        },
        {
            icon: Timer,
            title: 'Examens Chronométrés',
            description: 'Configurez des durées précises avec compte à rebours automatique et fermeture programmée.',
            color: '#0EA5E9',
            bg: '#E0F2FE'
        },
        {
            icon: TrendingUp,
            title: 'Analyses Détaillées',
            description: 'Suivez la progression avec des graphiques interactifs et des rapports de performance instantanés.',
            color: '#8B5CF6',
            bg: '#F3E8FF'
        },
        {
            icon: Lock,
            title: 'Sécurité Avancée',
            description: 'Protection des données et intégrité des examens garanties par des protocoles robustes.',
            color: '#10B981',
            bg: '#D1FAE5'
        }
    ];

    const stats = [
        { number: '10k+', label: 'Étudiants Actifs', icon: Users },
        { number: '500+', label: 'Établissements', icon: School },
        { number: '50k+', label: 'Quiz Créés', icon: FileCheck },
        { number: '99%', label: 'Taux de Satisfaction', icon: CheckCircle }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                :root {
                    --primary: #4F46E5;
                    --primary-dark: #4338CA;
                    --secondary: #8B5CF6;
                    --surface: #FFFFFF;
                    --text-main: #111827;
                    --text-muted: #6B7280;
                }

                .landing-header {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    transition: all 0.3s ease;
                    padding: 1.25rem 2rem;
                    background: transparent;
                }

                .landing-header.scrolled {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
                    padding: 1rem 2rem;
                }

                .hero-section {
                    position: relative;
                    padding: 8rem 2rem 6rem;
                    overflow: hidden;
                    text-align: center;
                }

                /* Abstract Background Shapes */
                .hero-bg-shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    z-index: 0;
                }

                .shape-1 {
                    top: -10%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: #C7D2FE;
                }

                .shape-2 {
                    bottom: 10%;
                    right: -5%;
                    width: 400px;
                    height: 400px;
                    background: #DDD6FE;
                }

                .hero-content {
                    position: relative;
                    z-index: 10;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .hero-title {
                    font-size: 4rem;
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    color: var(--text-main);
                    margin-bottom: 1.5rem;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 3rem;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn-glow {
                    position: relative;
                }
                
                .btn-glow::after {
                    content: '';
                    position: absolute;
                    top: -2px; left: -2px; right: -2px; bottom: -2px;
                    background: linear-gradient(135deg, #4F46E5, #8B5CF6);
                    z-index: -1;
                    border-radius: 9999px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .btn-glow:hover::after {
                    opacity: 0.5;
                    filter: blur(10px);
                }

                .stats-section {
                    padding: 4rem 2rem;
                    background: white;
                    border-top: 1px solid #F3F4F6;
                    border-bottom: 1px solid #F3F4F6;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }

                .feature-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    border: 1px solid #F3F4F6;
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: #C7D2FE;
                }

                .cta-section {
                    padding: 6rem 2rem;
                    background: linear-gradient(135deg, #111827 0%, #1F2937 100%);
                    color: white;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .hero-title { font-size: 2.5rem; }
                    .hero-section { padding: 6rem 1rem 4rem; }
                    .landing-header { padding: 1rem; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .stat-card { flex-direction: column; text-align: center; }
                }
            `}</style>

            {/* Header */}
            <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)' }}>
                        <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)', borderRadius: '12px', color: 'white', display: 'flex' }}>
                            <GraduationCap size={24} />
                        </div>
                        <span>QCM App</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/login')}
                            style={{ fontWeight: 600, color: 'white', backgroundColor: '#4F46E5', borderRadius: '9999px', padding: '0.625rem 1.5rem' }}
                        >
                            Se connecter
                        </Button>
                        <Button
                            onClick={() => navigate('/register')}
                            style={{
                                background: 'var(--text-main)',
                                color: 'white',
                                borderRadius: '9999px',
                                padding: '0.625rem 1.5rem',
                                fontWeight: 600
                            }}
                        >
                            S'inscrire
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-shape shape-1" />
                <div className="hero-bg-shape shape-2" />

                <div className="hero-content">
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: '#EEF2FF', color: '#4F46E5',
                        borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600,
                        marginBottom: '1.5rem', border: '1px solid #C7D2FE'
                    }}>
                        <span style={{ position: 'relative', display: 'flex', h: '8px', w: '8px' }}>
                            <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', height: '100%', width: '100%', borderRadius: '50%', background: '#4F46E5', opacity: 0.75 }}></span>
                            <span style={{ position: 'relative', height: '8px', width: '8px', borderRadius: '50%', background: '#4F46E5' }}></span>
                        </span>
                        Nouvelle version disponible
                    </div>

                    <h1 className="hero-title">
                        L'Excellence Académique <br />
                        <span className="gradient-text">À Portée de Clic</span>
                    </h1>

                    <p className="hero-subtitle">
                        Transformez l'évaluation avec notre plateforme intuitive.
                        Créez des quiz engageants, suivez les progrès en temps réel et simplifiez la gestion des examens pour votre établissement.
                    </p>

                    <div className="hero-buttons">
                        <Button
                            className="btn-glow"
                            onClick={() => navigate('/register')}
                            style={{
                                background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
                                color: 'white',
                                padding: '1rem 2.5rem',
                                fontSize: '1.125rem',
                                borderRadius: '9999px',
                                fontWeight: 600,
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            Commencer Gratuitement
                            <ArrowRight size={20} />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.125rem',
                                borderRadius: '9999px',
                                fontWeight: 600,
                                background: 'white',
                                color: '#4B5563',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            Se connecter
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div style={{
                                padding: '1rem', borderRadius: '12px',
                                background: '#F3F4F6', color: '#4B5563'
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                                    {stat.number}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500 }}>
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 2rem', background: '#fff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                            Tout ce dont vous avez besoin
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
                            Une suite complète d'outils conçus pour moderniser l'expérience éducative de votre école.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: feature.bg, color: feature.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#4B5563', lineHeight: 1.6 }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Prêt à transformer votre école ?
                    </h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem', lineHeight: 1.6 }}>
                        Rejoignez des centaines d'établissements qui font confiance à QCM App pour leurs évaluations.
                    </p>
                    <Button
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'white',
                            color: '#111827',
                            padding: '1rem 3rem',
                            fontSize: '1.125rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        Créer un compte maintenant
                    </Button>
                </div>

                {/* Decorative background circles */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#111827', color: '#9CA3AF', padding: '5rem 2rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                        <div style={{ gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                <GraduationCap /> QCM App
                            </div>
                            <p style={{ lineHeight: 1.6 }}>
                                La solution d'évaluation préférée des écoles modernes.
                                Simple. Rapide. Sécurisée.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.5rem' }}>Produit</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Fonctionnalités</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Tarifs</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Sécurité</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.5rem' }}>Ressources</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Documentation</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Guide Enseignant</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.5rem' }}>Légal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Confidentialité</a></li>
                                <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>CGU</a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        &copy; 2026 QCM App. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}
