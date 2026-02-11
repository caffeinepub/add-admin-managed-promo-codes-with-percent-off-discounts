import { useState } from 'react';
import { useSubmitOrder } from '../hooks/useOrders';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, Shield, CheckCircle2 } from 'lucide-react';
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
  attestation?: string;
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
  const [attestationChecked, setAttestationChecked] = useState(false);
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
    
    // Validate contact info
    Object.keys(formData).forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) (errors as any)[field] = error;
    });

    // Validate ID info
    const idFieldMap: Record<string, string> = {
      name: 'idName',
      dateOfBirth: 'idDateOfBirth',
      sex: 'idSex',
      height: 'idHeight',
      hairColor: 'idHairColor',
      eyeColor: 'idEyeColor',
      street: 'idStreet',
      city: 'idCity',
      state: 'idState',
      zip: 'idZip',
    };

    Object.entries(idFieldMap).forEach(([idKey, errorKey]) => {
      const error = validateField(errorKey, (idInfo as any)[idKey]);
      if (error) (errors as any)[errorKey] = error;
    });

    if (!photoFile) {
      errors.photo = 'Photo is required';
    }

    if (!signatureData) {
      errors.signature = 'Signature is required';
    }

    if (!attestationChecked) {
      errors.attestation = 'You must agree to the lawful use attestation to proceed';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setGeneralError('Please correct the errors above before submitting');
      return;
    }

    try {
      // Convert photo to bytes
      const photoBytes = await fileToBytes(photoFile!);
      const buffer = new ArrayBuffer(photoBytes.length);
      const view = new Uint8Array(buffer);
      view.set(photoBytes);
      const photoBlob = ExternalBlob.fromBytes(view);

      // Convert signature to bytes
      const signatureResponse = await fetch(signatureData!);
      const signatureBlob = await signatureResponse.blob();
      const signatureArrayBuffer = await signatureBlob.arrayBuffer();
      const signatureBuffer = new ArrayBuffer(signatureArrayBuffer.byteLength);
      const signatureView = new Uint8Array(signatureBuffer);
      signatureView.set(new Uint8Array(signatureArrayBuffer));
      const signatureExternalBlob = ExternalBlob.fromBytes(signatureView);

      const orderId = await submitOrderMutation.mutateAsync({
        customerName: formData.customerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state,
          zip: formData.zip.trim(),
        },
        idInfo: {
          height: idInfo.height.trim(),
          hairColor: idInfo.hairColor.trim(),
          eyeColor: idInfo.eyeColor.trim(),
          weight: idInfo.weight.trim(),
          dateOfBirth: idInfo.dateOfBirth.trim(),
          sex: idInfo.sex.trim(),
          photo: photoBlob,
          signature: signatureExternalBlob,
          name: idInfo.name.trim(),
          address: {
            street: idInfo.street.trim(),
            city: idInfo.city.trim(),
            state: idInfo.state,
            zip: idInfo.zip.trim(),
          },
        },
      });
      onOrderSubmitted(orderId.toString());
    } catch (error: any) {
      // Handle authentication errors specifically
      if (error.message?.includes('logged in') || error.message?.includes('Unauthorized')) {
        setGeneralError('You must be logged in to place an order. Please log in and try again.');
      } else {
        setGeneralError('Failed to submit order. Please try again.');
      }
      console.error('Order submission error:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
    setGeneralError('');
  };

  const handleIdInfoChange = (field: keyof typeof idInfo, value: string) => {
    setIdInfo((prev) => ({ ...prev, [field]: value }));
    const errorKey = `id${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    if (touched[errorKey]) {
      const error = validateField(errorKey, value);
      setFieldErrors(prev => ({ ...prev, [errorKey]: error }));
    }
    setGeneralError('');
  };

  return (
    <div className="container py-8 md:py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="relative mb-8 md:mb-12 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={getAssetUrl('assets/generated/falcon-ids-hero-banner.dim_1600x600.png')}
          alt="Falcon IDs Banner"
          className="w-full h-40 sm:h-48 md:h-64 lg:h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 flex items-center">
          <div className="container px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 md:mb-3">
              Order Your Novelty ID
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
              $100 per ID - includes 2 copies. Driver&apos;s License style available for all US states.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Information Card */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">What&apos;s Included</CardTitle>
              <CardDescription className="text-base">Every order includes these features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">2 Copies Included</h3>
                    <p className="text-sm text-muted-foreground">
                      Every order includes 2 identical copies of your novelty ID
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Driver&apos;s License Style</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional DL-style novelty cards for all US states
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Custom Photo & Signature</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your photo and add your signature directly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Fast Production</h3>
                    <p className="text-sm text-muted-foreground">
                      5-10 business days production after payment confirmation
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-destructive/50 bg-destructive/5">
            <Shield className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-sm ml-2">
              <strong className="font-semibold">Novelty Use Only:</strong> These are novelty items for entertainment purposes. 
              Not real government IDs. Using them to misrepresent identity is illegal. By ordering, you agree to lawful use only.
            </AlertDescription>
          </Alert>
        </div>

        {/* Order Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Order Form</CardTitle>
            <CardDescription>Fill out all fields to place your order</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    onBlur={() => handleBlur('customerName')}
                    placeholder="John Doe"
                    className={fieldErrors.customerName && touched.customerName ? 'border-destructive' : ''}
                  />
                  {fieldErrors.customerName && touched.customerName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="john@example.com"
                      className={fieldErrors.email && touched.email ? 'border-destructive' : ''}
                    />
                    {fieldErrors.email && touched.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      placeholder="(555) 123-4567"
                      className={fieldErrors.phone && touched.phone ? 'border-destructive' : ''}
                    />
                    {fieldErrors.phone && touched.phone && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Shipping Address</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    onBlur={() => handleBlur('street')}
                    placeholder="123 Main St"
                    className={fieldErrors.street && touched.street ? 'border-destructive' : ''}
                  />
                  {fieldErrors.street && touched.street && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.street}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      onBlur={() => handleBlur('city')}
                      placeholder="New York"
                      className={fieldErrors.city && touched.city ? 'border-destructive' : ''}
                    />
                    {fieldErrors.city && touched.city && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
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
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.state}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      onBlur={() => handleBlur('zip')}
                      placeholder="10001"
                      className={fieldErrors.zip && touched.zip ? 'border-destructive' : ''}
                    />
                    {fieldErrors.zip && touched.zip && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.zip}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* ID Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">ID Information</h3>
                </div>

                {/* Name on ID with Generate Toggle */}
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
                    onChange={(e) => handleIdInfoChange('name', e.target.value)}
                    onBlur={() => handleBlur('idName')}
                    placeholder="Jane Smith"
                    disabled={generateName}
                    className={fieldErrors.idName && touched.idName ? 'border-destructive' : ''}
                  />
                  {fieldErrors.idName && touched.idName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.idName}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idDateOfBirth">Date of Birth *</Label>
                    <Input
                      id="idDateOfBirth"
                      type="date"
                      value={idInfo.dateOfBirth}
                      onChange={(e) => handleIdInfoChange('dateOfBirth', e.target.value)}
                      onBlur={() => handleBlur('idDateOfBirth')}
                      className={fieldErrors.idDateOfBirth && touched.idDateOfBirth ? 'border-destructive' : ''}
                    />
                    {fieldErrors.idDateOfBirth && touched.idDateOfBirth && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idDateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idSex">Sex/Gender *</Label>
                    <Select value={idInfo.sex} onValueChange={(value) => handleIdInfoChange('sex', value)}>
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
                        <SelectItem value="X">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.idSex && touched.idSex && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idSex}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idHeight">Height *</Label>
                    <Input
                      id="idHeight"
                      value={idInfo.height}
                      onChange={(e) => handleIdInfoChange('height', e.target.value)}
                      onBlur={() => handleBlur('idHeight')}
                      placeholder="5'10&quot;"
                      className={fieldErrors.idHeight && touched.idHeight ? 'border-destructive' : ''}
                    />
                    {fieldErrors.idHeight && touched.idHeight && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idHeight}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idWeight">Weight (optional)</Label>
                    <Input
                      id="idWeight"
                      value={idInfo.weight}
                      onChange={(e) => handleIdInfoChange('weight', e.target.value)}
                      placeholder="150 lbs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idHairColor">Hair Color *</Label>
                    <Input
                      id="idHairColor"
                      value={idInfo.hairColor}
                      onChange={(e) => handleIdInfoChange('hairColor', e.target.value)}
                      onBlur={() => handleBlur('idHairColor')}
                      placeholder="Brown"
                      className={fieldErrors.idHairColor && touched.idHairColor ? 'border-destructive' : ''}
                    />
                    {fieldErrors.idHairColor && touched.idHairColor && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idHairColor}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idEyeColor">Eye Color *</Label>
                    <Input
                      id="idEyeColor"
                      value={idInfo.eyeColor}
                      onChange={(e) => handleIdInfoChange('eyeColor', e.target.value)}
                      onBlur={() => handleBlur('idEyeColor')}
                      placeholder="Blue"
                      className={fieldErrors.idEyeColor && touched.idEyeColor ? 'border-destructive' : ''}
                    />
                    {fieldErrors.idEyeColor && touched.idEyeColor && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idEyeColor}
                      </p>
                    )}
                  </div>
                </div>

                {/* ID Address with Generate Toggle */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Address on ID *</Label>
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
                      onChange={(e) => handleIdInfoChange('street', e.target.value)}
                      onBlur={() => handleBlur('idStreet')}
                      placeholder="456 Oak Ave"
                      disabled={generateIdAddress}
                      className={fieldErrors.idStreet && touched.idStreet ? 'border-destructive' : ''}
                    />
                    {fieldErrors.idStreet && touched.idStreet && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.idStreet}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="idCity">City *</Label>
                      <Input
                        id="idCity"
                        value={idInfo.city}
                        onChange={(e) => handleIdInfoChange('city', e.target.value)}
                        onBlur={() => handleBlur('idCity')}
                        placeholder="Los Angeles"
                        disabled={generateIdAddress}
                        className={fieldErrors.idCity && touched.idCity ? 'border-destructive' : ''}
                      />
                      {fieldErrors.idCity && touched.idCity && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {fieldErrors.idCity}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idState">State *</Label>
                      <Select
                        value={idInfo.state}
                        onValueChange={(value) => handleIdInfoChange('state', value)}
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
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {fieldErrors.idState}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idZip">ZIP Code *</Label>
                      <Input
                        id="idZip"
                        value={idInfo.zip}
                        onChange={(e) => handleIdInfoChange('zip', e.target.value)}
                        onBlur={() => handleBlur('idZip')}
                        placeholder="90001"
                        disabled={generateIdAddress}
                        className={fieldErrors.idZip && touched.idZip ? 'border-destructive' : ''}
                      />
                      {fieldErrors.idZip && touched.idZip && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {fieldErrors.idZip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Photo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    4
                  </div>
                  <h3 className="text-lg font-semibold">Photo & Signature</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Upload Photo *</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={fieldErrors.photo ? 'border-destructive' : ''}
                  />
                  {fieldErrors.photo && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.photo}
                    </p>
                  )}
                  {photoPreview && (
                    <div className="mt-3">
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a clear, front-facing photo. Max 5MB. JPG, PNG, or WebP.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Signature *</Label>
                  <SignaturePad onSignatureChange={setSignatureData} />
                  {fieldErrors.signature && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.signature}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Attestation */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <Checkbox
                    id="attestation"
                    checked={attestationChecked}
                    onCheckedChange={(checked) => {
                      setAttestationChecked(checked as boolean);
                      if (checked) {
                        setFieldErrors(prev => ({ ...prev, attestation: undefined }));
                      }
                    }}
                    className={fieldErrors.attestation ? 'border-destructive' : ''}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="attestation" className="text-sm font-medium cursor-pointer leading-relaxed">
                      I understand these are novelty items for entertainment purposes only. I will not use them to 
                      misrepresent my identity or for any illegal purpose. I am ordering these for lawful use only.
                    </Label>
                    {fieldErrors.attestation && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.attestation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* General Error */}
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-semibold"
                disabled={submitOrderMutation.isPending || !isAuthenticated}
              >
                {submitOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Order...
                  </>
                ) : (
                  'Submit Order - $100'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
