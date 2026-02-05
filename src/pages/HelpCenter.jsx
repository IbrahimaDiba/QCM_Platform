import React, { useState } from 'react';
import Card from '../components/ui/Card';
import {
    Book,
    User,
    GraduationCap,
    ShieldCheck,
    Search,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Phone,
    Mail,
    ExternalLink
} from 'lucide-react';

const HelpSection = ({ title, icon: Icon, children, isOpen, onToggle }) => (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'white' }}>
        <button
            onClick={onToggle}
            style={{
                width: '100%',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <Icon size={20} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{title}</span>
            </div>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && (
            <div style={{ padding: '0 1.25rem 1.25rem 4rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                {children}
            </div>
        )}
    </div>
);

export default function HelpCenter() {
    const [activeTab, setActiveTab] = useState('student');
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    const tabs = [
        { id: 'student', label: 'Élève', icon: User },
        { id: 'teacher', label: 'Professeur', icon: GraduationCap },
        { id: 'admin', label: 'Admin', icon: ShieldCheck }
    ];

    const content = {
        student: [
            {
                id: 's1',
                title: 'Comment passer un examen ?',
                icon: Book,
                text: 'Accédez à votre tableau de bord, choisissez un quiz disponible et cliquez sur "Commencer". Assurez-vous d\'avoir une connexion stable avant de débuter.'
            },
            {
                id: 's2',
                title: 'Voir mes résultats détaillés',
                icon: Search,
                text: 'Dans l\'onglet "Mes Résultats", cliquez sur un examen pour voir votre score et la correction question par question.'
            },
            {
                id: 's3',
                title: 'Temps limité et progression',
                icon: Book,
                text: 'Chaque quiz a une limite de temps. La barre en haut de l\'écran vous indique votre progression et le temps restant.'
            }
        ],
        teacher: [
            {
                id: 't1',
                title: 'Créer mon premier quiz',
                icon: GraduationCap,
                text: 'Allez dans "Mes Quiz", puis "Nouveau Quiz". Remplissez le titre, la classe et ajoutez vos questions. N\'oubliez pas de cocher la bonne réponse pour chaque option.'
            },
            {
                id: 't2',
                title: 'Suivre les performances des élèves',
                icon: Search,
                text: 'L\'onglet "Résultats" vous permet de voir les scores de tous les élèves ayant passé vos examens en temps réel.'
            },
            {
                id: 't3',
                title: 'Statut Brouillon vs Publié',
                icon: ShieldCheck,
                text: 'Un quiz en mode "Brouillon" n\'est pas visible par les élèves. Passez-le en "Publié" dès qu\'il est prêt pour l\'évaluation.'
            }
        ],
        admin: [
            {
                id: 'a1',
                title: 'Gestion des établissements',
                icon: ShieldCheck,
                text: 'Dans "Gestion des Écoles", vous pouvez ajouter de nouveaux établissements. Chaque professeur et élève doit être rattaché à une école.'
            },
            {
                id: 'a2',
                title: 'Modération des comptes',
                icon: User,
                text: 'Vous avez la possibilité de voir tous les utilisateurs inscrits et de gérer leurs accès ou de supprimer des comptes obsolètes.'
            }
        ]
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <style>{`
                .help-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    padding: 3rem 2rem;
                    border-radius: var(--radius-xl);
                    color: white;
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .tab-container {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    background-color: #f3f4f6;
                    padding: 0.5rem;
                    border-radius: var(--radius-xl);
                }
                .tab-button {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-radius: var(--radius-lg);
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .tab-button.active {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 3rem;
                }
                @media (max-width: 640px) {
                    .help-header { padding: 2rem 1rem; }
                    .tab-container { flex-direction: column; }
                }
            `}</style>

            <div className="help-header">
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Centre d'Aide</h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Tout ce qu'il faut savoir pour maîtriser la plateforme QCM.</p>
            </div>

            <div className="tab-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: '400px' }}>
                {content[activeTab].map(section => (
                    <HelpSection
                        key={section.id}
                        title={section.title}
                        icon={section.icon}
                        isOpen={openSection === section.id}
                        onToggle={() => toggleSection(section.id)}
                    >
                        {section.text}
                    </HelpSection>
                ))}
            </div>

            <div className="contact-grid">
                <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)' }}><Phone size={24} /></div>
                    <div>
                        <div style={{ fontWeight: 600 }}>Téléphone</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>+221 77 232 70 57</div>
                    </div>
                </Card>
                <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)' }}><Mail size={24} /></div>
                    <div>
                        <div style={{ fontWeight: 600 }}>Email Support</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>support@qcm-app.com</div>
                    </div>
                </Card>
                <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)' }}><MessageCircle size={24} /></div>
                    <div>
                        <div style={{ fontWeight: 600 }}>Chat Direct</div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Disponible 24h/24</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
