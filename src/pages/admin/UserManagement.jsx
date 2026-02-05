import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Edit2, Users, Search, Filter, Mail, School, Shield, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*, schools!school_id(name)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error fetching users:', error);
                throw error;
            }
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert(`Impossible de charger les utilisateurs: ${error.message || 'Erreur inconnue'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) throw error;
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                alert('Erreur: ' + error.message);
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchLower) ||
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.schools?.name?.toLowerCase() || '').includes(searchLower);
        return matchesRole && matchesSearch;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="t-h2">Gestion des Utilisateurs</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        variant="outline"
                        onClick={fetchUsers}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Actualiser
                    </Button>
                </div>
            </div>

            <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.625rem 0.625rem 2.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)'
                        }}
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="student">Élèves</option>
                        <option value="teacher">Professeurs</option>
                        <option value="admin">Administrateurs</option>
                    </select>
                </div>
            </Card>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des utilisateurs...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> Nom</div>
                                    </th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Email</div>
                                    </th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><School size={16} /> École</div>
                                    </th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={16} /> Rôle</div>
                                    </th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Inscription</div>
                                    </th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{user.full_name || 'Sans nom'}</td>
                                            <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{user.email || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Non renseigné</span>}</td>
                                            <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{user.schools?.name || '—'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    backgroundColor: user.role === 'admin' ? '#FEE2E2' : user.role === 'teacher' ? '#E0E7FF' : '#DCFCE7',
                                                    color: user.role === 'admin' ? '#DC2626' : user.role === 'teacher' ? 'var(--color-primary)' : 'var(--color-success)',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {user.role === 'student' ? 'Élève' : user.role === 'teacher' ? 'Professeur' : user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        style={{ padding: '0.5rem', color: 'var(--color-danger)', cursor: 'pointer', background: 'none', border: 'none' }}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                            <p>Aucun utilisateur trouvé.</p>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-warning)' }}>
                                                Si des utilisateurs devraient apparaître ici, vérifiez les politiques RLS (Row Level Security) dans Supabase.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

