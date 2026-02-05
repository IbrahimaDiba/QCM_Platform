import React from 'react';

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...props
}) {
    const baseClass = 'btn';
    const variantClass = {
        'outline': 'btn-outline',
        'danger': 'btn-danger',
        'primary': 'btn-primary'
    }[variant] || 'btn-primary';

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
