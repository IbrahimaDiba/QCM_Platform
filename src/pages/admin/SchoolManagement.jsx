import React, { useState } from 'react';
import { useSchools } from '../../contexts/SchoolContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Navigation } from 'lucide-react';

export default function SchoolManagement() {
    const { schools, addSchool, deleteSchool } = useSchools();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.city) {
            alert('Veuillez remplir au moins le nom et la ville');
            return;
        }
        try {
            await addSchool(formData);
            setFormData({ name: '', address: '', city: '' });
            setShowForm(false);
        } catch (error) {
            alert("Erreur lors de l'ajout de l'école. Veuillez réessayer.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
            try {
                await deleteSchool(id);
            } catch (error) {
                alert("Impossible de supprimer cette école. Elle est peut-être liée à des utilisateurs.");
            }
        }
    };

    return (
        <div className="school-management-container">
            <style>{`
                .school-management-container {
                    padding: 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .school-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .school-form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .table-container {
                    overflow-x: auto;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .schools-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    min-width: 600px; /* Ensure table doesn't squish too much */
                }
                
                .schools-table th {
                    padding: 1rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    background-color: var(--color-background);
                    border-bottom: 1px solid var(--color-border);
                    white-space: nowrap;
                }
                
                .schools-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--color-border);
                }
                
                @media (min-width: 768px) {
                    .school-management-container {
                        padding: 2rem;
                    }
                    
                    .school-form-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .school-form-full {
                        grid-column: span 2;
                    }
                }
                
                @media (max-width: 480px) {
                    .school-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .school-header button {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="school-header">
                <h1 className="t-h2">Gestion des Écoles</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Ajouter une école
                </Button>
            </div>

            {showForm && (
                <Card style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }}>Nouvelle École</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="school-form-grid">
                            <div className="school-form-full">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nom de l'école *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Lycée Victor Hugo"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adresse</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ex: 123 Rue de Paris"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ville *</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ex: Paris"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
                            <Button type="submit">Ajouter</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="schools-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Adresse</th>
                                <th>Ville</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((school) => (
                                <tr key={school.id}>
                                    <td style={{ fontWeight: 500 }}>
                                        {school.name}
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {school.address || '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Navigation size={14} style={{ color: 'var(--color-text-muted)' }} flexShrink={0} />
                                            {school.city}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(school.id)}
                                            style={{ color: 'var(--color-danger)', cursor: 'pointer', padding: '0.5rem' }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {schools.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Aucune école enregistrée
                    </div>
                )}
            </Card>
        </div>
    );
}
