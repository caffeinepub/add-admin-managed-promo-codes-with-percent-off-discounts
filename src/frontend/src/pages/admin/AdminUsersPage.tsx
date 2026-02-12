import { useState, useMemo } from 'react';
import { useGetAllOrders } from '../../hooks/useOrders';
import { useBanUser, useUnbanUser, useGetBannedUsers } from '../../hooks/useUserBans';
import AdminAccessGate from '../../components/admin/AdminAccessGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Users, ShieldOff, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface AdminUsersPageProps {
  onBack?: () => void;
}

function AdminUsersContent({ onBack }: AdminUsersPageProps) {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: bannedUsers = [], isLoading: bannedLoading } = useGetBannedUsers();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const [principalInput, setPrincipalInput] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const [actionPrincipal, setActionPrincipal] = useState<Principal | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | null>(null);

  // Extract unique principals from orders
  const knownPrincipals = useMemo(() => {
    const principalMap = new Map<string, { principal: Principal; customerName: string; email: string }>();
    
    orders.forEach((order) => {
      const principalStr = order.owner.toString();
      if (!principalMap.has(principalStr)) {
        principalMap.set(principalStr, {
          principal: order.owner,
          customerName: order.customerName,
          email: order.email,
        });
      }
    });

    return Array.from(principalMap.values());
  }, [orders]);

  const isBanned = (principal: Principal): boolean => {
    return bannedUsers.some((banned) => banned.toString() === principal.toString());
  };

  const handleBanClick = (principal: Principal) => {
    setActionPrincipal(principal);
    setActionType('ban');
  };

  const handleUnbanClick = (principal: Principal) => {
    setActionPrincipal(principal);
    setActionType('unban');
  };

  const handleConfirmAction = async () => {
    if (!actionPrincipal || !actionType) return;

    try {
      if (actionType === 'ban') {
        await banMutation.mutateAsync(actionPrincipal);
        toast.success('User banned successfully');
      } else {
        await unbanMutation.mutateAsync(actionPrincipal);
        toast.success('User unbanned successfully');
      }
      setActionPrincipal(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${actionType} user`);
    }
  };

  const handleBanByPrincipal = async () => {
    setPrincipalError('');

    if (!principalInput.trim()) {
      setPrincipalError('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await banMutation.mutateAsync(principal);
      toast.success('User banned successfully');
      setPrincipalInput('');
    } catch (error: any) {
      if (error?.message?.includes('Invalid principal')) {
        setPrincipalError('Invalid principal ID format');
      } else {
        setPrincipalError(error?.message || 'Failed to ban user');
      }
    }
  };

  const isLoading = ordersLoading || bannedLoading;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Panel
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user access and bans</p>
        </div>
        <Users className="h-8 w-8 text-primary" />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{knownPrincipals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-3xl">
              {knownPrincipals.filter((u) => !isBanned(u.principal)).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Banned Users</CardDescription>
            <CardTitle className="text-3xl">{bannedUsers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Ban by Principal ID */}
      <Card>
        <CardHeader>
          <CardTitle>Ban User by Principal ID</CardTitle>
          <CardDescription>
            Enter a principal ID to ban a user who may not have placed an order yet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="principal-input">Principal ID</Label>
              <Input
                id="principal-input"
                value={principalInput}
                onChange={(e) => {
                  setPrincipalInput(e.target.value);
                  setPrincipalError('');
                }}
                placeholder="Enter principal ID..."
                disabled={banMutation.isPending}
              />
              {principalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{principalError}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleBanByPrincipal}
                disabled={banMutation.isPending || !principalInput.trim()}
              >
                {banMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Banning...
                  </>
                ) : (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Ban User
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Known Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Known Users ({knownPrincipals.length})</CardTitle>
          <CardDescription>Users who have placed orders</CardDescription>
        </CardHeader>
        <CardContent>
          {knownPrincipals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knownPrincipals.map((user) => {
                    const banned = isBanned(user.principal);
                    return (
                      <TableRow key={user.principal.toString()}>
                        <TableCell className="font-medium">{user.customerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {user.principal.toString().slice(0, 20)}...
                        </TableCell>
                        <TableCell>
                          {banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {banned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanClick(user.principal)}
                              disabled={unbanMutation.isPending}
                            >
                              {unbanMutation.isPending &&
                              actionPrincipal?.toString() === user.principal.toString() ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ShieldCheck className="mr-2 h-4 w-4" />
                              )}
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanClick(user.principal)}
                              disabled={banMutation.isPending}
                            >
                              {banMutation.isPending &&
                              actionPrincipal?.toString() === user.principal.toString() ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ShieldOff className="mr-2 h-4 w-4" />
                              )}
                              Ban
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banned Users List */}
      {bannedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Banned Users ({bannedUsers.length})</CardTitle>
            <CardDescription>All currently banned principals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.map((principal) => (
                    <TableRow key={principal.toString()}>
                      <TableCell className="font-mono text-sm">{principal.toString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnbanClick(principal)}
                          disabled={unbanMutation.isPending}
                        >
                          {unbanMutation.isPending &&
                          actionPrincipal?.toString() === principal.toString() ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-2 h-4 w-4" />
                          )}
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!actionPrincipal}
        onOpenChange={(open) => !open && setActionPrincipal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' ? 'Ban User' : 'Unban User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban'
                ? 'Are you sure you want to ban this user? They will not be able to access the application.'
                : 'Are you sure you want to unban this user? They will regain access to the application.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={banMutation.isPending || unbanMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={banMutation.isPending || unbanMutation.isPending}
              className={
                actionType === 'ban'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {(banMutation.isPending || unbanMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {actionType === 'ban' ? 'Banning...' : 'Unbanning...'}
                </>
              ) : actionType === 'ban' ? (
                'Ban User'
              ) : (
                'Unban User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsersPage(props: AdminUsersPageProps) {
  return (
    <AdminAccessGate>
      <AdminUsersContent {...props} />
    </AdminAccessGate>
  );
}
