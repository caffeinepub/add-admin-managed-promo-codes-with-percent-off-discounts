import { useState, useMemo } from 'react';
import { useGetAllOrders } from '../../hooks/useOrders';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Search, Filter, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PaymentContactStatus, Order } from '../../backend';

interface AdminOrdersPageProps {
  onOrderClick: (orderId: string) => void;
}

export default function AdminOrdersPage({ onOrderClick }: AdminOrdersPageProps) {
  const { identity } = useInternetIdentity();
  const { isAdmin, isLoading: adminLoading } = useCheckAdminAccess();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shipped'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentContactStatus>('all');

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentContactStatus === paymentFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.id.toString().includes(query)
      );
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => Number(b.createdTime - a.createdTime));

    return filtered;
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, shipped: 0 };
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
    };
  }, [orders]);

  const getPaymentStatusLabel = (status: PaymentContactStatus): string => {
    switch (status) {
      case 'notContacted':
        return 'Not Contacted';
      case 'contacted':
        return 'Contacted';
      case 'paymentReceived':
        return 'Payment Received';
      default:
        return 'Unknown';
    }
  };

  const getPaymentStatusVariant = (status: PaymentContactStatus): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'notContacted':
        return 'outline';
      case 'contacted':
        return 'default';
      case 'paymentReceived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!identity) {
    return (
      <div className="container py-12 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (adminLoading || ordersLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasOrders = orders && orders.length > 0;
  const hasFilteredResults = filteredOrders.length > 0;
  const isFiltering = searchQuery.trim() !== '' || statusFilter !== 'all' || paymentFilter !== 'all';

  return (
    <div className="container py-8 md:py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Shipped Orders</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">{stats.shipped}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Orders</CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by customer name, email, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="status-filter" className="sr-only">Filter by status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger id="status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="payment-filter" className="sr-only">Filter by payment status</Label>
                <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
                  <SelectTrigger id="payment-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="notContacted">Not Contacted</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="paymentReceived">Payment Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasOrders ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-sm text-muted-foreground">
                Orders will appear here once customers start placing them.
              </p>
            </div>
          ) : !hasFilteredResults ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Matching Orders</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No orders match your current search or filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id.toString()} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{order.id.toString()}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {order.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {order.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                          {order.status === 'pending' ? 'Pending' : 'Shipped'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusVariant(order.paymentContactStatus)}>
                          {getPaymentStatusLabel(order.paymentContactStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOrderClick(order.id.toString())}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {hasFilteredResults && isFiltering && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredOrders.length} of {stats.total} orders
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
