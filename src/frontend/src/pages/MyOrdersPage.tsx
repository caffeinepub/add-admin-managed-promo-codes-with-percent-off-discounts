import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyOrders, useGetOrder } from '../hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowLeft, Calendar, MapPin, User, Phone, Mail, CreditCard, FileText } from 'lucide-react';
import { formatOrderDate, formatOrderStatus, formatPaymentContactStatus } from '../utils/orderFormatting';

export default function MyOrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetMyOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<bigint | null>(null);
  const { data: selectedOrder } = useGetOrder(selectedOrderId);

  const isAuthenticated = !!identity;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Package className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">My Orders</CardTitle>
            <CardDescription className="text-base">
              Please log in to view your orders
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              You need to be logged in to access your order history and track your orders.
            </p>
            <Button onClick={() => window.location.hash = '#/'} size="lg">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show order details view
  if (selectedOrderId && selectedOrder) {
    return (
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedOrderId(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </Button>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl">Order #{selectedOrder.id.toString()}</CardTitle>
                <CardDescription className="text-base mt-2">
                  Placed on {formatOrderDate(selectedOrder.createdTime)}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={selectedOrder.status === 'shipped' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                  {formatOrderStatus(selectedOrder.status)}
                </Badge>
                <Badge
                  variant={
                    selectedOrder.paymentContactStatus === 'paymentReceived'
                      ? 'default'
                      : selectedOrder.paymentContactStatus === 'contacted'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-sm px-3 py-1"
                >
                  {formatPaymentContactStatus(selectedOrder.paymentContactStatus)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{selectedOrder.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{selectedOrder.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{selectedOrder.phone}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Address
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                  {selectedOrder.shippingAddress.zip}
                </p>
              </div>
            </div>

            <Separator />

            {/* Order Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Status
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Status:</span>
                  <Badge variant={selectedOrder.status === 'shipped' ? 'default' : 'secondary'}>
                    {formatOrderStatus(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Status:</span>
                  <Badge
                    variant={
                      selectedOrder.paymentContactStatus === 'paymentReceived'
                        ? 'default'
                        : selectedOrder.paymentContactStatus === 'contacted'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {formatPaymentContactStatus(selectedOrder.paymentContactStatus)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {selectedOrder.paymentContactStatus === 'notContacted' && (
              <>
                <Separator />
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Information
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We will contact you via Snapchat to arrange payment once your order has been reviewed.
                  </p>
                  <div className="bg-background rounded p-3 space-y-1">
                    <p className="text-sm font-medium">Contact us on Snapchat:</p>
                    <p className="text-base font-mono text-primary">travis_c1</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Contact Snapchat: travis_c1 to receive Venmo payment details
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show orders list
  return (
    <div className="container py-8 md:py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Orders</h1>
        <p className="text-muted-foreground">View and track all your orders</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">No Orders Yet</CardTitle>
            <CardDescription className="text-base">
              You haven't placed any orders yet
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => (window.location.hash = '#/order')} size="lg">
              Place Your First Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card
              key={order.id.toString()}
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedOrderId(order.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Order #{order.id.toString()}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Placed on {formatOrderDate(order.createdTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'} className="text-sm px-3 py-1 w-fit">
                      {formatOrderStatus(order.status)}
                    </Badge>
                    <Badge
                      variant={
                        order.paymentContactStatus === 'paymentReceived'
                          ? 'default'
                          : order.paymentContactStatus === 'contacted'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-sm px-3 py-1 w-fit"
                    >
                      {formatPaymentContactStatus(order.paymentContactStatus)}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-2 w-fit">
                      <FileText className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
