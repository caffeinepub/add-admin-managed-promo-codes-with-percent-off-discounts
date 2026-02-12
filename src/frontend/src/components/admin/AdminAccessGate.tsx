import { ReactNode } from 'react';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, ShieldOff, AlertCircle } from 'lucide-react';
import LoginRequiredScreen from '../LoginRequiredScreen';
import { useAdminRestore } from '../../hooks/useAdminRestore';
import { toast } from 'sonner';
import { formatErrorMessage } from '../../utils/errorFormatting';

interface AdminAccessGateProps {
  children: ReactNode;
}

export default function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isAdmin, isLoading, error, refetch } = useCheckAdminAccess();
  const restoreMutation = useAdminRestore();

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync();
      toast.success('Admin access restored successfully');
      // Refetch admin status after successful restore
      await refetch();
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  // Show loading while Internet Identity is initializing
  if (isInitializing) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Show login required if not authenticated
  if (!identity) {
    return <LoginRequiredScreen />;
  }

  // Show loading while checking admin access
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error with retry option
  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Error Checking Access</CardTitle>
            <CardDescription className="text-center">
              We encountered an error while verifying your admin access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{formatErrorMessage(error)}</AlertDescription>
            </Alert>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied with restore option
  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <ShieldOff className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                Only administrators can access this area. If you believe you should have access,
                please contact the system administrator.
              </AlertDescription>
            </Alert>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                If you are the designated admin and lost access, you can restore it:
              </p>
              <Button
                onClick={handleRestore}
                disabled={restoreMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {restoreMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring Access...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Restore Admin Access
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and is admin - render children
  return <>{children}</>;
}
