import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, X } from 'lucide-react';
import type { Order, ShippingAddress } from '../../backend';

interface AdminOrderEditFormProps {
  order: Order;
  onSave: (data: {
    customerName: string;
    email: string;
    phone: string;
    shippingAddress: ShippingAddress;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function AdminOrderEditForm({
  order,
  onSave,
  onCancel,
  isSaving,
}: AdminOrderEditFormProps) {
  const [customerName, setCustomerName] = useState(order.customerName);
  const [email, setEmail] = useState(order.email);
  const [phone, setPhone] = useState(order.phone);
  const [street, setStreet] = useState(order.shippingAddress.street);
  const [city, setCity] = useState(order.shippingAddress.city);
  const [state, setState] = useState(order.shippingAddress.state);
  const [zip, setZip] = useState(order.shippingAddress.zip);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomerName(order.customerName);
    setEmail(order.email);
    setPhone(order.phone);
    setStreet(order.shippingAddress.street);
    setCity(order.shippingAddress.city);
    setState(order.shippingAddress.state);
    setZip(order.shippingAddress.zip);
  }, [order]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSave({
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      shippingAddress: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      },
    });
  };

  const hasChanges =
    customerName !== order.customerName ||
    email !== order.email ||
    phone !== order.phone ||
    street !== order.shippingAddress.street ||
    city !== order.shippingAddress.city ||
    state !== order.shippingAddress.state ||
    zip !== order.shippingAddress.zip;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Edit className="h-5 w-5 text-primary" />
          Edit Order Details
        </CardTitle>
        <CardDescription>Update customer information and shipping address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-customer-name">Customer Name</Label>
            <Input
              id="edit-customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isSaving}
              className={errors.customerName ? 'border-destructive' : ''}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-street">Street Address</Label>
                <Input
                  id="edit-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={isSaving}
                  className={errors.street ? 'border-destructive' : ''}
                />
                {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSaving}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isSaving}
                    className={errors.state ? 'border-destructive' : ''}
                  />
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-zip">ZIP Code</Label>
                <Input
                  id="edit-zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={isSaving}
                  className={errors.zip ? 'border-destructive' : ''}
                />
                {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={!hasChanges || isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
