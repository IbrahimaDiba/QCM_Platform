import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
    const { user, login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            // Redirection will be handled by the useEffect above once user profile is fetched
        } catch (error) {
            alert('Erreur de connexion: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            padding: '1rem'
        }}>
            <Card className="login-card" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
                <Link
                    to="/"
                    style={{
                        position: 'absolute',
                        left: '1.5rem',
                        top: '1.5rem',
                        color: 'var(--color-text-muted)',
                        padding: '0.5rem',
                        marginLeft: '-0.5rem',
                        marginTop: '-0.5rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-primary)';
                        e.currentTarget.style.backgroundColor = '#EEF2FF';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Retour à l'accueil"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '1rem' }}>
                    <h1 className="t-h1" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>QCM App</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <Button type="submit" disabled={loading} style={{ marginTop: '1rem', height: '3rem' }}>
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Pas encore de compte ?{' '}
                    <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Créer un compte
                    </Link>
                </p>
            </Card>
        </div>
    );
}
