import { useState, useMemo } from 'react';
import { useGetAllOrders } from '../../hooks/useOrders';
import { useCheckAdminAccess } from '../../hooks/useAdmin';
import AdminAccessGate from '../../components/admin/AdminAccessGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Search, Filter } from 'lucide-react';
import type { PaymentContactStatus, Order } from '../../backend';

interface AdminOrdersPageProps {
  onOrderClick: (orderId: string) => void;
}

function AdminOrdersContent({ onOrderClick }: AdminOrdersPageProps) {
  const { isAdmin } = useCheckAdminAccess();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders(isAdmin);
  
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

  if (ordersLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, email, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Order Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-filter">Payment Status</Label>
              <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
                <SelectTrigger id="payment-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="notContacted">Not Contacted</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="paymentReceived">Payment Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isFiltering && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders?.length || 0} orders
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders
          </CardTitle>
          <CardDescription>
            {hasFilteredResults
              ? `${filteredOrders.length} order${filteredOrders.length === 1 ? '' : 's'} found`
              : hasOrders
              ? 'No orders match your filters'
              : 'No orders yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasFilteredResults ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id.toString()}>
                      <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.email}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'shipped' ? 'secondary' : 'default'}>
                          {order.status === 'shipped' ? 'Shipped' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusVariant(order.paymentContactStatus)}>
                          {getPaymentStatusLabel(order.paymentContactStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(Number(order.createdTime) / 1_000_000).toLocaleDateString()}
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
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {hasOrders ? 'No orders match your current filters.' : 'No orders have been placed yet.'}
              </p>
              {isFiltering && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminOrdersPage(props: AdminOrdersPageProps) {
  return (
    <AdminAccessGate>
      <AdminOrdersContent {...props} />
    </AdminAccessGate>
  );
}
