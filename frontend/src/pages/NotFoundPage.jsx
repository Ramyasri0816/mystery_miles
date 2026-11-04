import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <Compass size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Destination Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem' }}>
        You seem to have wandered off the beaten trail. Let us guide you back to civilization.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
