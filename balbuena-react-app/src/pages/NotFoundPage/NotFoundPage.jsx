import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';

export default function NotFoundPage() {
  return (
    <div className="page center">
      <Card title="Page not found" description="The page you requested doesn’t exist.">
        <div className="stack">
          <Link className="button primary" to="/">
            Go to dashboard
          </Link>
          <Link className="button" to="/login">
            Go to login
          </Link>
        </div>
      </Card>
    </div>
  );
}

