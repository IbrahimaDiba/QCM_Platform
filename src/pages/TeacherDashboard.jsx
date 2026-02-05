import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="t-h1">Teacher Dashboard</h1>
                <Button variant="outline" onClick={logout}>Déconnexion</Button>
            </div>
            <div className="card">
                <h2 className="t-h2">Bienvenue, {user?.name}</h2>
                <p>Créez et gérez vos examens ici.</p>
            </div>
        </div>
    );
}
