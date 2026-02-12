import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useAcceptAdminInvitation, useDeclineAdminInvitation } from '../../hooks/useAdminInvitation';
import { toast } from 'sonner';

interface AdminInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminInvitationModal({ open, onOpenChange }: AdminInvitationModalProps) {
  const acceptMutation = useAcceptAdminInvitation();
  const declineMutation = useDeclineAdminInvitation();
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Reset closing state when modal opens
  useEffect(() => {
    if (open) {
      setIsClosing(false);
      setError(null);
    }
  }, [open]);

  const handleAccept = async () => {
    setError(null);
    setIsClosing(true);
    try {
      await acceptMutation.mutateAsync();
      toast.success('Admin access granted! You can now access the Admin Panel.');
      // Wait a moment for queries to refetch before closing
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (err: any) {
      setIsClosing(false);
      const errorMessage = err?.message || 'Failed to accept invitation';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDecline = async () => {
    setError(null);
    setIsClosing(true);
    try {
      await declineMutation.mutateAsync();
      toast.info('Admin invitation declined');
      onOpenChange(false);
    } catch (err: any) {
      setIsClosing(false);
      const errorMessage = err?.message || 'Failed to decline invitation';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isProcessing = acceptMutation.isPending || declineMutation.isPending || isClosing;

  return (
    <AlertDialog open={open} onOpenChange={isClosing ? undefined : onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">Admin Access Invitation</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed">
            You have been invited to become an administrator. Admins can view and manage all orders, update order
            statuses, and track payment information.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {declineMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              'Decline'
            )}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {acceptMutation.isPending || isClosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isClosing ? 'Updating...' : 'Accepting...'}
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Accept & Become Admin
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
