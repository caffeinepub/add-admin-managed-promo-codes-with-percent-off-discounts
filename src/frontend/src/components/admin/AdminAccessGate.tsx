import { ReactNode } from 'react';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminRestore } from '../../hooks/useAdminRestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react';
import LoginButton from '../LoginButton';
import { formatErrorMessage, extractBackendError } from '../../utils/errorFormatting';

interface AdminAccessGateProps {
  children: ReactNode;
}

export default function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isAdmin, isLoading, isFetched, error, refetch } = useCheckAdminAccess();
  const adminRestoreMutation = useAdminRestore();

  // Show loading state while Internet Identity is initializing
  if (isInitializing) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Initializing...</p>
      </div>
    );
  }

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

  // Not an admin - show access denied with restore option
  if (isFetched && !isAdmin) {
    const handleRestoreAdmin = async () => {
      try {
        await adminRestoreMutation.mutateAsync();
      } catch (error: any) {
        console.error('Failed to restore admin access:', error);
      }
    };

    const restoreErrorMessage = adminRestoreMutation.isError
      ? (() => {
          const backendError = extractBackendError(adminRestoreMutation.error);
          if (backendError) {
            return backendError;
          }
          return formatErrorMessage(adminRestoreMutation.error) || 'Failed to restore admin access. Please try again.';
        })()
      : '';

    return (
      <div className="container py-12 max-w-2xl space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Access Denied</p>
            <p className="text-sm">
              You do not have permission to access the admin panel. If you believe this is an error, you can try restoring your admin access below.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2">
              <RefreshCw className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">Restore Admin Access</h3>
              <p className="text-sm text-muted-foreground">
                Attempt to restore your administrator privileges
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This action will attempt to restore your administrator privileges. This is only available in specific recovery scenarios.
          </p>

          {adminRestoreMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-wrap break-words">
                {restoreErrorMessage}
              </AlertDescription>
            </Alert>
          )}

          {adminRestoreMutation.isSuccess && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Admin access restored successfully! Refreshing...
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleRestoreAdmin}
            disabled={adminRestoreMutation.isPending || adminRestoreMutation.isSuccess}
            className="w-full"
            variant="outline"
          >
            {adminRestoreMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restoring Access...
              </>
            ) : adminRestoreMutation.isSuccess ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Access Restored
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore Admin Access
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Admin access confirmed - render children
  return <>{children}</>;
}
