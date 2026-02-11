import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';
import { PaymentContactStatus } from '../../backend';

interface PaymentContactControlsProps {
  currentStatus: PaymentContactStatus;
  currentNotes: string;
  onUpdate: (status: PaymentContactStatus, notes: string) => Promise<void>;
  isUpdating: boolean;
}

export default function PaymentContactControls({
  currentStatus,
  currentNotes,
  onUpdate,
  isUpdating,
}: PaymentContactControlsProps) {
  const [status, setStatus] = useState<PaymentContactStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes);

  const hasChanges = status !== currentStatus || notes !== currentNotes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(status, notes);
  };

  const getStatusLabel = (s: PaymentContactStatus): string => {
    switch (s) {
      case PaymentContactStatus.notContacted:
        return 'Not Contacted';
      case PaymentContactStatus.contacted:
        return 'Contacted';
      case PaymentContactStatus.paymentReceived:
        return 'Payment Received';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Payment & Contact Status
        </CardTitle>
        <CardDescription>Track payment contact and collection progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-status">Payment Contact Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as PaymentContactStatus)}
              disabled={isUpdating}
            >
              <SelectTrigger id="payment-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentContactStatus.notContacted}>
                  {getStatusLabel(PaymentContactStatus.notContacted)}
                </SelectItem>
                <SelectItem value={PaymentContactStatus.contacted}>
                  {getStatusLabel(PaymentContactStatus.contacted)}
                </SelectItem>
                <SelectItem value={PaymentContactStatus.paymentReceived}>
                  {getStatusLabel(PaymentContactStatus.paymentReceived)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-notes">Contact Notes</Label>
            <Textarea
              id="contact-notes"
              placeholder="Add notes about payment contact, method, amount, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isUpdating}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Record payment details, contact attempts, or any relevant information
            </p>
          </div>

          <Button type="submit" disabled={!hasChanges || isUpdating} className="w-full">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Payment Status'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
