import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, LogOut, GraduationCap, FileText, Settings, ClipboardList, BarChart3, BookOpenCheck, PieChart, Menu, X } from 'lucide-react';

export default function DashboardLayout({ role }) {
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Define navigation items based on role
    const navItems = {
        admin: [
            { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/admin' },
            { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
            { icon: ClipboardList, label: 'Résultats', path: '/admin/results' },
            { icon: FileText, label: 'Examens', path: '/admin/exams' },
            { icon: GraduationCap, label: 'Écoles', path: '/admin/schools' },
        ],
        teacher: [
            { icon: BarChart3, label: 'Tableau de bord', path: '/teacher' },
            { icon: GraduationCap, label: 'Mes Examens', path: '/teacher/quizzes' },
            { icon: ClipboardList, label: 'Résultats', path: '/teacher/results' },
            { icon: Settings, label: 'Paramètres', path: '/teacher/settings' },
        ],
        student: [
            { icon: LayoutDashboard, label: 'Accueil', path: '/student' },
            { icon: Users, label: 'Mes Professeurs', path: '/student/teachers' },
            { icon: GraduationCap, label: 'Mes Résultats', path: '/student/results' },
        ]
    };

    const currentNavItems = navItems[role] || [];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)', flexDirection: 'column' }}>
            {/* Mobile Header */}
            <header className="mobile-header" style={{
                display: 'none', // Hidden by default (desktop)
                padding: '1rem',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem' }}>
                        <Menu size={24} color="var(--color-primary)" />
                    </button>
                    <span className="t-h3" style={{ color: 'var(--color-primary)' }}>QCM App</span>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Overlay for mobile */}
                {/* Overlay for mobile */}
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 30,
                    }}
                    className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                />

                {/* Sidebar */}
                <aside
                    className={`sidebar ${sidebarOpen ? 'open' : ''}`}
                >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="t-h2" style={{ color: 'var(--color-primary)' }}>QCM App</h1>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Espace {role}
                            </span>
                        </div>
                        <button
                            className="close-sidebar-btn"
                            onClick={() => setSidebarOpen(false)}
                            style={{ display: 'none' }} // Hidden on desktop
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {currentNavItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        end={item.path === `/admin` || item.path === `/teacher` || item.path === `/student`}
                                        onClick={() => setSidebarOpen(false)} // Close on navigate (mobile)
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                                            fontWeight: isActive ? 500 : 400,
                                        })}
                                    >
                                        <item.icon size={20} style={{ marginRight: '0.75rem', minWidth: '20px' }} />
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                minWidth: '32px'
                            }}>
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text)' }}>
                                    {user?.full_name || 'Utilisateur'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '0.5rem',
                                color: 'var(--color-danger)',
                                borderRadius: 'var(--radius-md)',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <LogOut size={18} style={{ marginRight: '0.5rem' }} />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            <style>{`
                /* Desktop Defaults */
                .sidebar {
                    width: 250px;
                    background-color: var(--color-surface);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 40; /* High z-index */
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .main-content {
                    flex: 1;
                    margin-left: 250px;
                    padding: 2rem;
                    min-height: 100vh;
                    width: calc(100% - 250px);
                    transition: margin-left 0.3s ease;
                }

                .mobile-header {
                    display: none;
                }

                .sidebar-overlay {
                    display: none;
                }

                /* Mobile Styles */
                @media (max-width: 1024px) {
                    .mobile-header {
                        display: flex !important;
                    }

                    .main-content {
                        margin-left: 0;
                        width: 100%;
                        padding: 1rem;
                        padding-top: 1rem;
                    }

                    .sidebar {
                        transform: translateX(-100%);
                        box-shadow: none;
                    }

                    .sidebar.open {
                        transform: translateX(0);
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                    }

                    .close-sidebar-btn {
                        display: block !important;
                    }

                    .sidebar-overlay {
                        display: block;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s ease;
                    }
                    
                    .sidebar-overlay.visible {
                        opacity: 1;
                        visibility: visible;
                    }
                }
            `}</style>
        </div>
    );
}
