import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthContext: Initializing session check...');
        // Check active session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                console.log('AuthContext: Session check result:', session ? 'Session found' : 'No session');
                if (session) {
                    fetchProfile(session.user);
                } else {
                    setLoading(false);
                }
            })
            .catch(error => {
                console.error('AuthContext: Error getting session:', error);
                setLoading(false); // Failsafe to show something
            });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AuthContext: Auth state changed:', _event, session ? 'Session present' : 'No session');
            if (session) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) throw error;

            // Prioritize profile data, then merge with metadata as fallback
            const metadataRole = authUser.user_metadata?.role;
            const profileRole = data?.role;
            const finalRole = profileRole || metadataRole;

            // Merge profile data with auth user, ensuring all fields are available
            setUser({
                ...authUser,
                ...data,
                role: finalRole,
                // Ensure critical fields from metadata are available if missing in profile
                school_id: data?.school_id || authUser.user_metadata?.school_id,
                class_level: data?.class_level || authUser.user_metadata?.class_level,
                full_name: data?.full_name || authUser.user_metadata?.full_name
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback: merge all metadata into user object
            const metadata = authUser.user_metadata || {};
            setUser({
                ...authUser,
                ...metadata,
                id: authUser.id,
                email: authUser.email,
                role: metadata.role || 'student'
            });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Navigation will be handled by the useEffect onAuthStateChange or manual check
        // But we can check role here if needed for specific redirect, 
        // though better to wait for profile fetch.
        return data;
    };

    const register = async (email, password, metadata) => {
        // Metadata contains role, full_name, etc., which are passed to the trigger
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // Saved to raw_user_meta_data, trigger creates profile
            },
        });

        if (error) throw error;

        // If auto-confirm is on, they are logged in.
        // If email confirm is on, they need to check email.
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    useEffect(() => {
        // Failsafe: if session initialization takes too long, stop loading
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('AuthContext: Session check timed out after 5s.');
                setLoading(false);
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [loading]);

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #4F46E5',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#6B7280' }}>Initialisation de la session...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
