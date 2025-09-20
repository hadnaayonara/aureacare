import React from 'react';
import AuthGuard from '../components/auth/AuthGuard';
import DashboardContent from '../components/dashboard/DashboardContent';

export default function Dashboard() {
  return (
    <AuthGuard>
      <div className="container max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <DashboardContent />
      </div>
    </AuthGuard>
  );
}