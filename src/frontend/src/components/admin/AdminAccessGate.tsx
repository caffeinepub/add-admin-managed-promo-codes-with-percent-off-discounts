import { ReactNode } from 'react';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import LoginButton from '../LoginButton';

interface AdminAccessGateProps {
  children: ReactNode;
}

export default function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { identity } = useInternetIdentity();
  const { isAdmin, isLoading, isFetched, error, refetch } = useCheckAdminAccess();

  // Not logged in - show login prompt
  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Admin Access Required</h2>
            <p className="text-muted-foreground">
              Please log in with your admin account to access this area.
            </p>
          </div>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  // Loading admin status
  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // Error checking admin status
  if (error && isFetched) {
    return (
      <div className="container py-12 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <div>
              <p className="font-medium mb-1">Unable to verify admin access</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : 'An error occurred while checking your permissions.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="self-start"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not an admin
  if (isFetched && !isAdmin) {
    return (
      <div className="container py-12 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Access Denied</p>
            <p className="text-sm">
              You do not have permission to access the admin panel. If you believe this is an error, please contact support.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Admin access confirmed - render children
  return <>{children}</>;
}
