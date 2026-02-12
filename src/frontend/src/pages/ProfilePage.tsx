import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCheckAdminAccess } from '../hooks/useAdmin';
import { useAdminRestore } from '../hooks/useAdminRestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Shield, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import LoginRequiredScreen from '../components/LoginRequiredScreen';
import BannedUserGate from '../components/BannedUserGate';
import { formatErrorMessage } from '../utils/errorFormatting';

function ProfilePageContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isAdmin } = useCheckAdminAccess();
  const saveProfileMutation = useSaveCallerUserProfile();
  const restoreMutation = useAdminRestore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }
  }, [userProfile]);

  // Track changes
  useEffect(() => {
    if (userProfile) {
      const changed =
        formData.name !== userProfile.name ||
        formData.email !== userProfile.email ||
        formData.phone !== userProfile.phone;
      setHasChanges(changed);
    } else {
      setHasChanges(formData.name.trim() !== '' || formData.email.trim() !== '' || formData.phone.trim() !== '');
    }
  }, [formData, userProfile]);

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login required screen if not authenticated
  if (!isAuthenticated) {
    return <LoginRequiredScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      toast.success('Profile saved successfully');
      setHasChanges(false);
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRestoreAdmin = async () => {
    try {
      await restoreMutation.mutateAsync();
      toast.success('Admin access restored successfully');
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  const handleCopyPrincipal = async () => {
    if (!identity) return;
    
    try {
      await navigator.clipboard.writeText(identity.getPrincipal().toString());
      setCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="container py-8 md:py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {showProfileSetup ? 'Complete Your Profile' : 'My Profile'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {showProfileSetup
            ? 'Please complete your profile to continue using the platform'
            : 'Manage your account information'}
        </p>
      </div>

      {profileLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                {showProfileSetup
                  ? 'This information will be used for your orders and account management'
                  : 'Update your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={saveProfileMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    disabled={saveProfileMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    disabled={saveProfileMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!hasChanges || saveProfileMutation.isPending}
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {showProfileSetup ? 'Complete Profile' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin Access Card */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Admin Access</CardTitle>
                </div>
                <CardDescription>
                  You have administrator privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => (window.location.hash = '/admin')}
                  className="w-full"
                >
                  Go to Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Restore Card (for non-admin users) */}
          {!isAdmin && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Admin Access</CardTitle>
                </div>
                <CardDescription>
                  Restore admin access if you are a designated administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleRestoreAdmin}
                  variant="outline"
                  className="w-full"
                  disabled={restoreMutation.isPending}
                >
                  {restoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    'Restore Admin Access'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Principal ID Card */}
          {identity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Your Principal ID</CardTitle>
                <CardDescription className="text-xs">
                  Your unique identifier on the Internet Computer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono break-all">
                    {identity.getPrincipal().toString()}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPrincipal}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <BannedUserGate>
      <ProfilePageContent />
    </BannedUserGate>
  );
}
