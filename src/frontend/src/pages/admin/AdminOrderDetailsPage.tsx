import { useState, useEffect } from 'react';
import { useGetOrder, useUpdatePaymentContactStatus } from '../../hooks/useOrders';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import AdminAccessGate from '../../components/admin/AdminAccessGate';
import PaymentContactControls from '../../components/admin/PaymentContactControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, User, MapPin, IdCard, Image as ImageIcon, PenTool } from 'lucide-react';
import { PaymentContactStatus } from '../../backend';
import { toast } from 'sonner';

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

function AdminOrderDetailsContent({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const { isAdmin } = useCheckAdminAccess();
  const orderIdBigInt = orderId ? BigInt(orderId) : null;
  const { data: order, isLoading } = useGetOrder(orderIdBigInt);
  const updatePaymentMutation = useUpdatePaymentContactStatus();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  // Load photo and signature when order is available
  useEffect(() => {
    if (order?.idInfo.photo) {
      order.idInfo.photo.getBytes().then((bytes: Uint8Array) => {
        const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPhotoUrl(url);
      });
    }
    if (order?.idInfo.signature) {
      order.idInfo.signature.getBytes().then((bytes: Uint8Array) => {
        const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setSignatureUrl(url);
      });
    }

    // Cleanup URLs on unmount
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      if (signatureUrl) URL.revokeObjectURL(signatureUrl);
    };
  }, [order]);

  const handlePaymentUpdate = async (status: PaymentContactStatus, notes: string) => {
    if (!order) return;
    
    try {
      await updatePaymentMutation.mutateAsync({
        orderId: order.id,
        status,
        notes,
      });
      toast.success('Payment status updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update payment status');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Order not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.toString()}</h1>
            <p className="text-muted-foreground mt-1">
              Placed on {new Date(Number(order.createdTime) / 1_000_000).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={order.status === 'shipped' ? 'secondary' : 'default'} className="text-base px-4 py-2">
            {order.status === 'shipped' ? 'Shipped' : 'Pending'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Payment Contact Status */}
        <PaymentContactControls
          currentStatus={order.paymentContactStatus}
          currentNotes={order.contactNotes}
          onUpdate={handlePaymentUpdate}
          isUpdating={updatePaymentMutation.isPending}
        />

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base break-all">{order.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{order.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ID Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              ID Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-base">{order.idInfo.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sex</p>
                <p className="text-base">{order.idInfo.sex}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Height</p>
                <p className="text-base">{order.idInfo.height}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weight</p>
                <p className="text-base">{order.idInfo.weight}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hair Color</p>
                <p className="text-base">{order.idInfo.hairColor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eye Color</p>
                <p className="text-base">{order.idInfo.eyeColor}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Photo */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Photo
              </h3>
              {photoUrl ? (
                <div className="rounded-lg border overflow-hidden max-w-xs">
                  <img src={photoUrl} alt="ID Photo" className="w-full h-auto" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photo uploaded</p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Signature */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Signature
              </h3>
              {signatureUrl ? (
                <div className="rounded-lg border overflow-hidden max-w-md bg-white p-4">
                  <img src={signatureUrl} alt="Signature" className="w-full h-auto" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No signature provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminOrderDetailsPage(props: AdminOrderDetailsPageProps) {
  return (
    <AdminAccessGate>
      <AdminOrderDetailsContent {...props} />
    </AdminAccessGate>
  );
}
