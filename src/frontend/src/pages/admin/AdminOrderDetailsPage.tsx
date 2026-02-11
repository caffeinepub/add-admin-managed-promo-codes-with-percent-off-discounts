import { useEffect, useState } from 'react';
import { useGetOrder, useUpdatePaymentContactStatus } from '../../hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package, User, MapPin, CreditCard, FileText } from 'lucide-react';
import { OrderStatus, PaymentContactStatus } from '../../backend';
import PaymentContactControls from '../../components/admin/PaymentContactControls';

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

export default function AdminOrderDetailsPage({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const { data: order, isLoading, error } = useGetOrder(orderId ? BigInt(orderId) : null);
  const updatePaymentMutation = useUpdatePaymentContactStatus();

  useEffect(() => {
    if (order?.idInfo?.photo) {
      const url = order.idInfo.photo.getDirectURL();
      setPhotoUrl(url);
    }
    if (order?.idInfo?.signature) {
      const url = order.idInfo.signature.getDirectURL();
      setSignatureUrl(url);
    }
  }, [order]);

  const handlePaymentUpdate = async (status: PaymentContactStatus, notes: string) => {
    if (!order) return;
    await updatePaymentMutation.mutateAsync({
      orderId: order.id,
      status,
      notes,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Order not found or you don't have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Badge variant="outline">Pending</Badge>;
      case OrderStatus.shipped:
        return <Badge className="bg-green-500">Shipped</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'notContacted':
        return <Badge variant="outline">Not Contacted</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500">Contacted</Badge>;
      case 'paymentReceived':
        return <Badge className="bg-green-500">Payment Received</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
                <CardDescription className="mt-1">
                  Placed on {new Date(Number(order.createdTime) / 1000000).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentContactStatus)}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.email}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.phone}</p>
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
                <p className="font-medium">{order.shippingAddress.street}</p>
                <p className="font-medium">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ID Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ID Information
            </CardTitle>
            <CardDescription>Driver's License style novelty ID details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{order.idInfo.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sex/Gender</p>
                <p className="font-medium">{order.idInfo.sex || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-medium">{order.idInfo.height || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium">{order.idInfo.weight || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hair Color</p>
                <p className="font-medium">{order.idInfo.hairColor || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eye Color</p>
                <p className="font-medium">{order.idInfo.eyeColor || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Photo */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">ID Photo</p>
                {photoUrl ? (
                  <div className="rounded-lg overflow-hidden border-2 border-border w-full max-w-xs">
                    <img src={photoUrl} alt="ID Photo" className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border w-full max-w-xs h-48 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No photo uploaded</p>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Signature</p>
                {signatureUrl ? (
                  <div className="rounded-lg overflow-hidden border-2 border-border w-full max-w-xs bg-white p-4">
                    <img src={signatureUrl} alt="Signature" className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border w-full max-w-xs h-24 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No signature provided</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Contact Management */}
        <PaymentContactControls
          currentStatus={order.paymentContactStatus}
          currentNotes={order.contactNotes}
          onUpdate={handlePaymentUpdate}
          isUpdating={updatePaymentMutation.isPending}
        />
      </div>
    </div>
  );
}
