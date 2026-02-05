import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useSchools } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { schools } = useSchools();
    const { user, register, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        // Student-specific fields
        studentNumber: '',
        classLevel: '',
        parentPhone: '',
        schoolId: '', // AJOUT : ID de l'école sélectionnée
        establishment: '',
        location: ''
    });

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            navigate(`/${user.role}`);
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            alert('Veuillez remplir tous les champs obligatoires');
            setLoading(false);
            return;
        }

        // Student validation
        if (formData.role === 'student') {
            if (!formData.schoolId) {
                alert("Veuillez sélectionner votre établissement.");
                setLoading(false);
                return;
            }
            if (!formData.classLevel) {
                alert("Veuillez sélectionner votre classe.");
                setLoading(false);
                return;
            }
        }

        try {
            await register(formData.email, formData.password, {
                full_name: formData.name,
                email: formData.email, // Add email to metadata for profile trigger
                role: formData.role,
                school_id: formData.schoolId || null, // Pass schoolId
                student_number: formData.studentNumber || null,
                parent_phone: formData.parentPhone || null,
                class_level: formData.classLevel || null,
                establishment: formData.establishment || null,
                location: formData.location || null
            });
            alert(`Compte créé avec succès !`);
            // Redirection will be handled by the useEffect above
        } catch (error) {
            console.error(error);
            let message = "Erreur lors de l'inscription: " + error.message;

            if (error.message.includes('rate limit')) {
                message = "Trop de tentatives d'inscription ou d'envoi d'emails. Veuillez patienter une heure ou désactiver la confirmation par email dans votre tableau de bord Supabase (Authentication > Providers > Email > Confirm email).";
            } else if (error.message.includes('already registered')) {
                message = "Cet email est déjà utilisé.";
            }

            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            padding: '2rem'
        }}>
            <Card style={{ maxWidth: '500px', width: '100%' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        <ArrowLeft size={16} />
                        Retour à la connexion
                    </Link>
                    <h1 className="t-h1" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                        <UserPlus size={32} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Créer un compte
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Rejoignez QCM App dès aujourd'hui</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom complet</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Jean Dupont"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jean.dupont@ecole.com"
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
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Student-specific fields - conditional */}
                    {formData.role === 'student' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Numéro d'élève</label>
                                <input
                                    type="text"
                                    name="studentNumber"
                                    value={formData.studentNumber}
                                    onChange={handleChange}
                                    placeholder="Ex: 2024001"
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Classe</label>
                                <select
                                    name="classLevel"
                                    value={formData.classLevel}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '1rem',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Sélectionnez une classe</option>
                                    <option value="6eme">6ème</option>
                                    <option value="5eme">5ème</option>
                                    <option value="4eme">4ème</option>
                                    <option value="3eme">3ème</option>
                                    <option value="2nde">Seconde</option>
                                    <option value="1ere">Première</option>
                                    <option value="terminale">Terminale</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Téléphone du parent</label>
                                <input
                                    type="tel"
                                    name="parentPhone"
                                    value={formData.parentPhone}
                                    onChange={handleChange}
                                    placeholder="Ex: +33 6 12 34 56 78"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Establishment - for both students and teachers */}
                    {formData.role !== 'admin' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Établissement</label>
                            <select
                                name="establishment"
                                value={formData.schoolId || ''}
                                onChange={(e) => {
                                    const selectedSchool = schools.find(s => s.id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        schoolId: e.target.value,
                                        establishment: selectedSchool ? selectedSchool.name : ''
                                    });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '1rem',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Sélectionnez une école</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name} - {school.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Location - only for students */}
                    {formData.role === 'student' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ville</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: Paris"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    )}

                    {/* Role selection - moved to the end */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Je suis</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={formData.role === 'student'}
                                    onChange={handleChange}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <span>Élève</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="teacher"
                                    checked={formData.role === 'teacher'}
                                    onChange={handleChange}
                                    style={{ width: '1.25rem', height: '1.25rem' }}
                                />
                                <span>Professeur</span>
                            </label>

                        </div>
                    </div>

                    <Button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem' }}>
                        {loading ? 'Création en cours...' : 'Créer mon compte'}
                    </Button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Se connecter
                    </Link>
                </p>
            </Card>
        </div>
    );
}
