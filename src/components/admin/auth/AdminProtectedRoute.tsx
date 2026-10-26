import React, { useEffect } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AdminLoginView } from './AdminLoginView';
import { Store, Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  onExitToStorefront: () => void;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  onExitToStorefront
}) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Reflect current route in browser URL
        if (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin')) {
          window.history.replaceState(null, '', '/admin/login');
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-lg mb-3">
          <Store className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Loader2 className="w-4 h-4 text-brand-700 animate-spin" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  // Unauthorized: redirect to /admin/login view
  if (!isAuthenticated) {
    return (
      <AdminLoginView
        onSuccess={() => {
          window.history.replaceState(null, '', '/admin/dashboard');
        }}
        onExitToStorefront={onExitToStorefront}
      />
    );
  }

  // Authorized: render protected admin dashboard
  return <>{children}</>;
};
