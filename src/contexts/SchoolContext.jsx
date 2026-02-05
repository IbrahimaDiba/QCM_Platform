import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SchoolContext = createContext();

export const useSchools = () => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error('useSchools must be used within SchoolProvider');
    }
    return context;
};

export const SchoolProvider = ({ children }) => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('name');

            if (error) throw error;
            setSchools(data || []);
        } catch (error) {
            console.error('Error fetching schools:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSchool = async (school) => {
        try {
            const { data, error } = await supabase
                .from('schools')
                .insert([school])
                .select();

            if (error) throw error;
            if (data) {
                setSchools(prev => [...prev, ...data]);
                return data[0];
            }
        } catch (error) {
            console.error('Error adding school:', error);
            throw error;
        }
    };

    const deleteSchool = async (id) => {
        try {
            const { error } = await supabase
                .from('schools')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSchools(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting school:', error);
            throw error;
        }
    };

    return (
        <SchoolContext.Provider value={{ schools, addSchool, deleteSchool, fetchSchools, loading }}>
            {children}
        </SchoolContext.Provider>
    );
};
