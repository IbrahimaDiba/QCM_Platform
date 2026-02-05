import React from 'react';

export default function ResponsiveContainer({ children, maxWidth = '1400px' }) {
    return (
        <div style={{
            maxWidth,
            margin: '0 auto',
            padding: '1rem',
            paddingBottom: '3rem'
        }}>
            <style>{`
                @media (min-width: 768px) {
                    .responsive-container {
                        padding: 1.5rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    .responsive-container {
                        padding: 2rem;
                    }
                }
            `}</style>
            <div className="responsive-container">
                {children}
            </div>
        </div>
    );
}
