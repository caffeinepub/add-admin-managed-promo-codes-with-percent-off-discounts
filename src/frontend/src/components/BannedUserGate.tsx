import { ReactNode } from 'react';
import { useCheckIfBanned } from '../hooks/useUserBans';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldOff } from 'lucide-react';

interface BannedUserGateProps {
  children: ReactNode;
}

export default function BannedUserGate({ children }: BannedUserGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const principal = identity?.getPrincipal() || null;
  const { data: isBanned, isLoading } = useCheckIfBanned(principal);

  // Show loading while checking
  if (isInitializing || isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If not authenticated or not banned, show content
  if (!identity || !isBanned) {
    return <>{children}</>;
  }

  // Show banned message
  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldOff className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-center">Access Restricted</CardTitle>
          <CardDescription className="text-center">
            Your account has been suspended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Your account has been banned and you no longer have access to this feature. 
              If you believe this is an error, please contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
