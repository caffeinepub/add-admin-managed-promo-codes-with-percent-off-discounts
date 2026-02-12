import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfile';
import { useCheckAdminAccess } from '../hooks/useAdmin';
import { useAdminRestore } from '../hooks/useAdminRestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, CheckCircle2, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import LoginRequiredScreen from '../components/LoginRequiredScreen';
import { formatErrorMessage, extractBackendError } from '../utils/errorFormatting';

export default function ProfilePage() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const { isAdmin, isLoading: adminCheckLoading } = useCheckAdminAccess();
  const adminRestoreMutation = useAdminRestore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);

  const isAuthenticated = !!identity;

  // Load profile data when available
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
      setHasChanges(
        formData.name.trim() !== '' ||
        formData.email.trim() !== '' ||
        formData.phone.trim() !== ''
      );
    }
  }, [formData, userProfile]);

  // Show restore success message
  useEffect(() => {
    if (adminRestoreMutation.isSuccess) {
      setShowRestoreSuccess(true);
      setTimeout(() => setShowRestoreSuccess(false), 5000);
    }
  }, [adminRestoreMutation.isSuccess]);

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

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleRestoreAdmin = async () => {
    try {
      await adminRestoreMutation.mutateAsync();
    } catch (error: any) {
      console.error('Failed to restore admin access:', error);
    }
  };

  const handleGoToAdmin = () => {
    window.location.hash = '/admin';
  };

  const isSubmitting = saveProfileMutation.isPending;
  const isValid = formData.name.trim() && formData.email.trim() && formData.phone.trim();

  // Format error message with backend details
  const errorMessage = saveProfileMutation.isError
    ? (() => {
        const backendError = extractBackendError(saveProfileMutation.error);
        const genericMessage = 'Failed to save profile. Please try again.';
        
        if (backendError) {
          return `${genericMessage} Details: ${backendError}`;
        }
        
        const formattedError = formatErrorMessage(saveProfileMutation.error);
        if (formattedError && formattedError !== 'An unknown error occurred') {
          return `${genericMessage} Details: ${formattedError}`;
        }
        
        return genericMessage;
      })()
    : '';

  // Format admin restore error message
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
    <div className="container py-8 md:py-12 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account information and contact details
        </p>
      </div>

      {profileLoading && !isFetched ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your name, email, and phone number. This information is used for order processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                </div>

                {saveProfileMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-wrap break-words">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {showSuccessMessage && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Profile saved successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!isValid || !hasChanges || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Admin Panel Access Card */}
          {!adminCheckLoading && isAdmin && (
            <Card className="mt-6 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Admin Access</CardTitle>
                    <CardDescription>
                      You have administrator privileges
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGoToAdmin}
                  className="w-full"
                  variant="default"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Go to Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Restore Card - shown when logged in but not admin */}
          {!adminCheckLoading && !isAdmin && (
            <Card className="mt-6 border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Restore Admin Access</CardTitle>
                    <CardDescription>
                      If you previously had admin access, you can attempt to restore it
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {showRestoreSuccess && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Admin access restored successfully! The page will update momentarily.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleRestoreAdmin}
                  disabled={adminRestoreMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {adminRestoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restoring Access...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restore Admin Access
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
