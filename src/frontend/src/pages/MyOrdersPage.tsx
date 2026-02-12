import { useState } from 'react';
import { useGetMyOrders } from '../hooks/useOrders';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Package, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import LoginRequiredScreen from '../components/LoginRequiredScreen';
import BannedUserGate from '../components/BannedUserGate';
import type { Order } from '../backend';
import { formatOrderDate, formatOrderStatus, formatPaymentContactStatus } from '../utils/orderFormatting';

function MyOrdersContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: orders = [], isLoading } = useGetMyOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'shipped':
        return <Badge>Shipped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Orders</h1>
        <p className="text-lg text-muted-foreground">
          View and track all your ID card orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders. Start by creating your first ID card order.
            </p>
            <Button onClick={() => (window.location.hash = '/order')}>
              Place an Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id.toString()} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Order #{order.id.toString()}</CardTitle>
                    <CardDescription>
                      Placed on {formatOrderDate(order.createdTime)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Address</p>
                    <p className="font-medium">
                      {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status</p>
                    <p className="font-medium">{formatPaymentContactStatus(order.paymentContactStatus)}</p>
                  </div>
                  {order.trackingNumber && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium font-mono">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id.toString()}</DialogTitle>
                <DialogDescription>
                  Placed on {formatOrderDate(selectedOrder.createdTime)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Status</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">ID Information</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">Height:</span> {selectedOrder.idInfo.height}</p>
                    <p><span className="text-muted-foreground">Weight:</span> {selectedOrder.idInfo.weight}</p>
                    <p><span className="text-muted-foreground">Hair Color:</span> {selectedOrder.idInfo.hairColor}</p>
                    <p><span className="text-muted-foreground">Eye Color:</span> {selectedOrder.idInfo.eyeColor}</p>
                    <p><span className="text-muted-foreground">Date of Birth:</span> {selectedOrder.idInfo.dateOfBirth}</p>
                    <p><span className="text-muted-foreground">Sex:</span> {selectedOrder.idInfo.sex}</p>
                  </div>
                </div>

                {selectedOrder.trackingNumber && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Tracking Information</h3>
                      <p className="text-sm font-mono">{selectedOrder.trackingNumber}</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <BannedUserGate>
      <MyOrdersContent />
    </BannedUserGate>
  );
}
