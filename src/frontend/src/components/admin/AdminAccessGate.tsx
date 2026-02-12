import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminPanelSession } from '../../hooks/useAdminPanelSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldOff } from 'lucide-react';
import LoginRequiredScreen from '../LoginRequiredScreen';

interface AdminAccessGateProps {
  children: ReactNode;
}

export default function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isAdminPanelLoggedIn, isLoading: sessionLoading } = useAdminPanelSession();

  // Show loading while Internet Identity is initializing
  if (isInitializing || sessionLoading) {
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

  // Show admin login required if no admin panel session
  if (!isAdminPanelLoggedIn) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldOff className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Admin Login Required</CardTitle>
            <CardDescription className="text-center">
              You must log in with admin credentials to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => (window.location.hash = '/admin-login')}
              className="w-full"
            >
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has admin panel session - render children
  return <>{children}</>;
}
