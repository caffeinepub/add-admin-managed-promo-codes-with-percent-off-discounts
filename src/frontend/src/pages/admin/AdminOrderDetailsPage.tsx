import { useState } from 'react';
import { useGetOrder, useUpdateOrderStatus, useUpdateOrder } from '../../hooks/useOrders';
import AdminAccessGate from '../../components/admin/AdminAccessGate';
import PaymentContactControls from '../../components/admin/PaymentContactControls';
import AdminOrderEditForm from '../../components/admin/AdminOrderEditForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Package, User, Mail, Phone, MapPin, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus, PaymentContactStatus } from '../../backend';
import type { ShippingAddress } from '../../backend';

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

function AdminOrderDetailsContent({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const orderIdBigInt = orderId ? BigInt(orderId) : null;
  const { data: order, isLoading } = useGetOrder(orderIdBigInt);
  const updateStatusMutation = useUpdateOrderStatus();
  const updateOrderMutation = useUpdateOrder();
  const [isEditMode, setIsEditMode] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: newStatus as OrderStatus,
      });
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update order status');
    }
  };

  const handlePaymentUpdate = async (status: PaymentContactStatus, notes: string) => {
    if (!order) return;

    try {
      await updateOrderMutation.mutateAsync({
        orderId: order.id,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        shippingAddress: order.shippingAddress,
        idInfo: order.idInfo,
        status: order.status as OrderStatus,
        paymentContactStatus: status,
        contactNotes: notes,
      });
      toast.success('Payment status updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update payment status');
    }
  };

  const handleEditSave = async (data: {
    customerName: string;
    email: string;
    phone: string;
    shippingAddress: ShippingAddress;
  }) => {
    if (!order) return;

    try {
      await updateOrderMutation.mutateAsync({
        orderId: order.id,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        shippingAddress: data.shippingAddress,
        idInfo: order.idInfo,
        status: order.status as OrderStatus,
        paymentContactStatus: order.paymentContactStatus,
        contactNotes: order.contactNotes,
      });
      toast.success('Order updated successfully');
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update order');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Order not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        {!isEditMode && (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.toString()}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.createdTime)}</p>
        </div>
        <Package className="h-8 w-8 text-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Edit Form or Customer Information */}
        {isEditMode ? (
          <div className="md:col-span-2">
            <AdminOrderEditForm
              order={order}
              onSave={handleEditSave}
              onCancel={() => setIsEditMode(false)}
              isSaving={updateOrderMutation.isPending}
            />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{order.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic space-y-1">
                  <p className="font-medium">{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zip}
                  </p>
                </address>
              </CardContent>
            </Card>
          </>
        )}

        {/* Order Status */}
        {!isEditMode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Status
              </CardTitle>
              <CardDescription>Update the current order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-status">Status</Label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger id="order-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Current Status:</p>
                <div className="mt-2">
                  {order.status === OrderStatus.pending ? (
                    <Badge variant="outline">Pending</Badge>
                  ) : (
                    <Badge>Shipped</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ID Information */}
        {!isEditMode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                ID Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{order.idInfo.height}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{order.idInfo.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hair Color</p>
                  <p className="font-medium">{order.idInfo.hairColor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eye Color</p>
                  <p className="font-medium">{order.idInfo.eyeColor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{order.idInfo.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-medium">{order.idInfo.sex}</p>
                </div>
              </div>

              {order.idInfo.photo && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">ID Photo</p>
                  <img
                    src={order.idInfo.photo.getDirectURL()}
                    alt="ID Photo"
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}

              {order.idInfo.signature && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Signature</p>
                  <img
                    src={order.idInfo.signature.getDirectURL()}
                    alt="Signature"
                    className="w-full max-w-xs rounded-lg border bg-white"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment & Contact Status */}
        {!isEditMode && (
          <div className="md:col-span-2">
            <PaymentContactControls
              currentStatus={order.paymentContactStatus}
              currentNotes={order.contactNotes}
              onUpdate={handlePaymentUpdate}
              isUpdating={updateOrderMutation.isPending}
            />
          </div>
        )}
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
