import React from 'react';

export default function Card({ title, description, actions, children, className = '' }) {
  return (
    <section className={`cardx ${className}`}>
      {(title || description || actions) && (
        <header className="cardx-header">
          <div>
            {title && <div className="cardx-title">{title}</div>}
            {description && <div className="cardx-description">{description}</div>}
          </div>
          {actions && <div className="cardx-actions">{actions}</div>}
        </header>
      )}
      <div className="cardx-body">{children}</div>
    </section>
  );
}

