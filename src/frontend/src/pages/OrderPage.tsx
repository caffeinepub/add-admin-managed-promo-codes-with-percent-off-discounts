import { useState } from 'react';
import { useSubmitOrder } from '../hooks/useOrders';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getAssetUrl } from '../utils/assetPaths';
import { US_STATES } from '../utils/usStates';
import { validateImageFile, fileToBytes } from '../utils/fileValidation';
import SignaturePad from '../components/SignaturePad';
import { ExternalBlob } from '../backend';
import { generateFullName, generateAddress } from '../utils/idGenerators';
import LoginRequiredScreen from '../components/LoginRequiredScreen';

interface OrderPageProps {
  onOrderSubmitted: (orderId: string) => void;
}

interface FieldError {
  customerName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  idName?: string;
  idDateOfBirth?: string;
  idSex?: string;
  idHeight?: string;
  idHairColor?: string;
  idEyeColor?: string;
  idStreet?: string;
  idCity?: string;
  idState?: string;
  idZip?: string;
  photo?: string;
  signature?: string;
}

export default function OrderPage({ onOrderSubmitted }: OrderPageProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const [idInfo, setIdInfo] = useState({
    name: '',
    dateOfBirth: '',
    sex: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const [generateName, setGenerateName] = useState(false);
  const [generateIdAddress, setGenerateIdAddress] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [generalError, setGeneralError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const submitOrderMutation = useSubmitOrder();

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

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'customerName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (value.trim().length < 10) return 'Please enter a valid phone number';
        break;
      case 'street':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Please enter a complete street address';
        break;
      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'Please enter a valid city name';
        break;
      case 'state':
        if (!value.trim()) return 'State is required';
        break;
      case 'zip':
        if (!value.trim()) return 'ZIP code is required';
        if (!/^\d{5}(-\d{4})?$/.test(value.trim())) return 'Please enter a valid ZIP code';
        break;
      case 'idName':
        if (!value.trim()) return 'Name on ID is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'idDateOfBirth':
        if (!value.trim()) return 'Date of birth is required';
        break;
      case 'idSex':
        if (!value.trim()) return 'Sex/Gender is required';
        break;
      case 'idHeight':
        if (!value.trim()) return 'Height is required';
        break;
      case 'idHairColor':
        if (!value.trim()) return 'Hair color is required';
        break;
      case 'idEyeColor':
        if (!value.trim()) return 'Eye color is required';
        break;
      case 'idStreet':
        if (!value.trim()) return 'ID address street is required';
        break;
      case 'idCity':
        if (!value.trim()) return 'ID address city is required';
        break;
      case 'idState':
        if (!value.trim()) return 'ID address state is required';
        break;
      case 'idZip':
        if (!value.trim()) return 'ID address ZIP is required';
        if (!/^\d{5}(-\d{4})?$/.test(value.trim())) return 'Please enter a valid ZIP code';
        break;
    }
    return undefined;
  };

  const getFieldValue = (field: string): string => {
    // Map field names to their values
    if (field === 'idName') return idInfo.name;
    if (field === 'idDateOfBirth') return idInfo.dateOfBirth;
    if (field === 'idSex') return idInfo.sex;
    if (field === 'idHeight') return idInfo.height;
    if (field === 'idHairColor') return idInfo.hairColor;
    if (field === 'idEyeColor') return idInfo.eyeColor;
    if (field === 'idStreet') return idInfo.street;
    if (field === 'idCity') return idInfo.city;
    if (field === 'idState') return idInfo.state;
    if (field === 'idZip') return idInfo.zip;
    
    // Contact/shipping fields
    return (formData as any)[field] || '';
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = getFieldValue(field);
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFieldErrors(prev => ({ ...prev, photo: validation.error }));
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    setPhotoFile(file);
    setFieldErrors(prev => ({ ...prev, photo: undefined }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateNameToggle = (checked: boolean) => {
    setGenerateName(checked);
    if (checked) {
      const generatedName = generateFullName();
      setIdInfo(prev => ({ ...prev, name: generatedName }));
      setFieldErrors(prev => ({ ...prev, idName: undefined }));
    }
  };

  const handleGenerateIdAddressToggle = (checked: boolean) => {
    setGenerateIdAddress(checked);
    if (checked) {
      const generatedAddress = generateAddress();
      setIdInfo(prev => ({
        ...prev,
        street: generatedAddress.street,
        city: generatedAddress.city,
        state: generatedAddress.state,
        zip: generatedAddress.zip,
      }));
      setFieldErrors(prev => ({
        ...prev,
        idStreet: undefined,
        idCity: undefined,
        idState: undefined,
        idZip: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Check authentication before proceeding
    if (!isAuthenticated) {
      setGeneralError('You must be logged in to place an order. Please log in and try again.');
      return;
    }

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      customerName: true,
      email: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      idName: true,
      idDateOfBirth: true,
      idSex: true,
      idHeight: true,
      idHairColor: true,
      idEyeColor: true,
      idStreet: true,
      idCity: true,
      idState: true,
      idZip: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const errors: FieldError = {};
    Object.keys(allTouched).forEach(field => {
      const value = getFieldValue(field);
      const error = validateField(field, value);
      if (error) errors[field as keyof FieldError] = error;
    });

    // Validate photo
    if (!photoFile) {
      errors.photo = 'Photo is required';
    }

    // Validate signature
    if (!signatureData) {
      errors.signature = 'Signature is required';
    }

    setFieldErrors(errors);

    // If there are errors, scroll to first error and stop
    if (Object.keys(errors).length > 0) {
      setGeneralError('Please fix the errors above before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Convert photo to bytes - cast to satisfy TypeScript
      const photoBytes = await fileToBytes(photoFile!) as Uint8Array<ArrayBuffer>;
      const photoBlob = ExternalBlob.fromBytes(photoBytes);

      // Convert signature to bytes
      const signatureResponse = await fetch(signatureData!);
      const signatureArrayBuffer = await signatureResponse.arrayBuffer();
      const signatureBytes = new Uint8Array(signatureArrayBuffer);
      const signatureBlob = ExternalBlob.fromBytes(signatureBytes);

      const orderId = await submitOrderMutation.mutateAsync({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        idInfo: {
          name: idInfo.name,
          height: idInfo.height,
          hairColor: idInfo.hairColor,
          eyeColor: idInfo.eyeColor,
          weight: idInfo.weight,
          dateOfBirth: idInfo.dateOfBirth,
          sex: idInfo.sex,
          address: {
            street: idInfo.street,
            city: idInfo.city,
            state: idInfo.state,
            zip: idInfo.zip,
          },
          photo: photoBlob,
          signature: signatureBlob,
        },
      });

      onOrderSubmitted(orderId.toString());
    } catch (error: any) {
      console.error('Order submission error:', error);
      setGeneralError(error.message || 'Failed to submit order. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Place Your Order</h1>
        <p className="text-lg text-muted-foreground">
          Fill out the form below to order your custom ID card. All fields are required.
        </p>
      </div>

      {generalError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>We'll use this to contact you about your order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                onBlur={() => handleBlur('customerName')}
                placeholder="John Doe"
                className={fieldErrors.customerName && touched.customerName ? 'border-destructive' : ''}
              />
              {fieldErrors.customerName && touched.customerName && (
                <p className="text-sm text-destructive">{fieldErrors.customerName}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  placeholder="john@example.com"
                  className={fieldErrors.email && touched.email ? 'border-destructive' : ''}
                />
                {fieldErrors.email && touched.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={() => handleBlur('phone')}
                  placeholder="(555) 123-4567"
                  className={fieldErrors.phone && touched.phone ? 'border-destructive' : ''}
                />
                {fieldErrors.phone && touched.phone && (
                  <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Where should we send your ID cards?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                onBlur={() => handleBlur('street')}
                placeholder="123 Main St"
                className={fieldErrors.street && touched.street ? 'border-destructive' : ''}
              />
              {fieldErrors.street && touched.street && (
                <p className="text-sm text-destructive">{fieldErrors.street}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  onBlur={() => handleBlur('city')}
                  placeholder="New York"
                  className={fieldErrors.city && touched.city ? 'border-destructive' : ''}
                />
                {fieldErrors.city && touched.city && (
                  <p className="text-sm text-destructive">{fieldErrors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => {
                    setFormData({ ...formData, state: value });
                    setFieldErrors(prev => ({ ...prev, state: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="state"
                    className={fieldErrors.state && touched.state ? 'border-destructive' : ''}
                    onBlur={() => handleBlur('state')}
                  >
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.state && touched.state && (
                  <p className="text-sm text-destructive">{fieldErrors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  onBlur={() => handleBlur('zip')}
                  placeholder="10001"
                  className={fieldErrors.zip && touched.zip ? 'border-destructive' : ''}
                />
                {fieldErrors.zip && touched.zip && (
                  <p className="text-sm text-destructive">{fieldErrors.zip}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Information */}
        <Card>
          <CardHeader>
            <CardTitle>ID Information</CardTitle>
            <CardDescription>Information that will appear on your ID card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="idName">Name on ID *</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="generateName"
                    checked={generateName}
                    onCheckedChange={handleGenerateNameToggle}
                  />
                  <Label htmlFor="generateName" className="text-sm font-normal cursor-pointer">
                    Generate random name
                  </Label>
                </div>
              </div>
              <Input
                id="idName"
                value={idInfo.name}
                onChange={(e) => setIdInfo({ ...idInfo, name: e.target.value })}
                onBlur={() => handleBlur('idName')}
                placeholder="John Doe"
                disabled={generateName}
                className={fieldErrors.idName && touched.idName ? 'border-destructive' : ''}
              />
              {fieldErrors.idName && touched.idName && (
                <p className="text-sm text-destructive">{fieldErrors.idName}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idDateOfBirth">Date of Birth *</Label>
                <Input
                  id="idDateOfBirth"
                  type="date"
                  value={idInfo.dateOfBirth}
                  onChange={(e) => setIdInfo({ ...idInfo, dateOfBirth: e.target.value })}
                  onBlur={() => handleBlur('idDateOfBirth')}
                  className={fieldErrors.idDateOfBirth && touched.idDateOfBirth ? 'border-destructive' : ''}
                />
                {fieldErrors.idDateOfBirth && touched.idDateOfBirth && (
                  <p className="text-sm text-destructive">{fieldErrors.idDateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idSex">Sex/Gender *</Label>
                <Select
                  value={idInfo.sex}
                  onValueChange={(value) => {
                    setIdInfo({ ...idInfo, sex: value });
                    setFieldErrors(prev => ({ ...prev, idSex: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="idSex"
                    className={fieldErrors.idSex && touched.idSex ? 'border-destructive' : ''}
                    onBlur={() => handleBlur('idSex')}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.idSex && touched.idSex && (
                  <p className="text-sm text-destructive">{fieldErrors.idSex}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idHeight">Height *</Label>
                <Input
                  id="idHeight"
                  value={idInfo.height}
                  onChange={(e) => setIdInfo({ ...idInfo, height: e.target.value })}
                  onBlur={() => handleBlur('idHeight')}
                  placeholder="5'10&quot;"
                  className={fieldErrors.idHeight && touched.idHeight ? 'border-destructive' : ''}
                />
                {fieldErrors.idHeight && touched.idHeight && (
                  <p className="text-sm text-destructive">{fieldErrors.idHeight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idWeight">Weight</Label>
                <Input
                  id="idWeight"
                  value={idInfo.weight}
                  onChange={(e) => setIdInfo({ ...idInfo, weight: e.target.value })}
                  placeholder="170 lbs"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idHairColor">Hair Color *</Label>
                <Input
                  id="idHairColor"
                  value={idInfo.hairColor}
                  onChange={(e) => setIdInfo({ ...idInfo, hairColor: e.target.value })}
                  onBlur={() => handleBlur('idHairColor')}
                  placeholder="Brown"
                  className={fieldErrors.idHairColor && touched.idHairColor ? 'border-destructive' : ''}
                />
                {fieldErrors.idHairColor && touched.idHairColor && (
                  <p className="text-sm text-destructive">{fieldErrors.idHairColor}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idEyeColor">Eye Color *</Label>
                <Input
                  id="idEyeColor"
                  value={idInfo.eyeColor}
                  onChange={(e) => setIdInfo({ ...idInfo, eyeColor: e.target.value })}
                  onBlur={() => handleBlur('idEyeColor')}
                  placeholder="Blue"
                  className={fieldErrors.idEyeColor && touched.idEyeColor ? 'border-destructive' : ''}
                />
                {fieldErrors.idEyeColor && touched.idEyeColor && (
                  <p className="text-sm text-destructive">{fieldErrors.idEyeColor}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Address on ID</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="generateIdAddress"
                    checked={generateIdAddress}
                    onCheckedChange={handleGenerateIdAddressToggle}
                  />
                  <Label htmlFor="generateIdAddress" className="text-sm font-normal cursor-pointer">
                    Generate random address
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idStreet">Street Address *</Label>
                <Input
                  id="idStreet"
                  value={idInfo.street}
                  onChange={(e) => setIdInfo({ ...idInfo, street: e.target.value })}
                  onBlur={() => handleBlur('idStreet')}
                  placeholder="123 Main St"
                  disabled={generateIdAddress}
                  className={fieldErrors.idStreet && touched.idStreet ? 'border-destructive' : ''}
                />
                {fieldErrors.idStreet && touched.idStreet && (
                  <p className="text-sm text-destructive">{fieldErrors.idStreet}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idCity">City *</Label>
                  <Input
                    id="idCity"
                    value={idInfo.city}
                    onChange={(e) => setIdInfo({ ...idInfo, city: e.target.value })}
                    onBlur={() => handleBlur('idCity')}
                    placeholder="New York"
                    disabled={generateIdAddress}
                    className={fieldErrors.idCity && touched.idCity ? 'border-destructive' : ''}
                  />
                  {fieldErrors.idCity && touched.idCity && (
                    <p className="text-sm text-destructive">{fieldErrors.idCity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idState">State *</Label>
                  <Select
                    value={idInfo.state}
                    onValueChange={(value) => {
                      setIdInfo({ ...idInfo, state: value });
                      setFieldErrors(prev => ({ ...prev, idState: undefined }));
                    }}
                    disabled={generateIdAddress}
                  >
                    <SelectTrigger
                      id="idState"
                      className={fieldErrors.idState && touched.idState ? 'border-destructive' : ''}
                      onBlur={() => handleBlur('idState')}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.idState && touched.idState && (
                    <p className="text-sm text-destructive">{fieldErrors.idState}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idZip">ZIP Code *</Label>
                  <Input
                    id="idZip"
                    value={idInfo.zip}
                    onChange={(e) => setIdInfo({ ...idInfo, zip: e.target.value })}
                    onBlur={() => handleBlur('idZip')}
                    placeholder="10001"
                    disabled={generateIdAddress}
                    className={fieldErrors.idZip && touched.idZip ? 'border-destructive' : ''}
                  />
                  {fieldErrors.idZip && touched.idZip && (
                    <p className="text-sm text-destructive">{fieldErrors.idZip}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Photo *</CardTitle>
            <CardDescription>Upload a clear photo for your ID card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className={fieldErrors.photo ? 'border-destructive' : ''}
              />
              {fieldErrors.photo && (
                <p className="text-sm text-destructive">{fieldErrors.photo}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, GIF. Maximum size: 5MB
              </p>
            </div>

            {photoPreview && (
              <div className="mt-4">
                <Label className="mb-2 block">Preview:</Label>
                <img
                  src={photoPreview}
                  alt="Photo preview"
                  className="max-w-xs rounded-lg border-2 border-border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Signature *</CardTitle>
            <CardDescription>Draw your signature below</CardDescription>
          </CardHeader>
          <CardContent>
            <SignaturePad
              onSignatureChange={(data) => {
                setSignatureData(data);
                if (data) {
                  setFieldErrors(prev => ({ ...prev, signature: undefined }));
                }
              }}
            />
            {fieldErrors.signature && (
              <p className="text-sm text-destructive mt-2">{fieldErrors.signature}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={submitOrderMutation.isPending}
            className="min-w-[200px]"
          >
            {submitOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
