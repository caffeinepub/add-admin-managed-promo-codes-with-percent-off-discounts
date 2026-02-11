import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Home, Package, Truck, Clock, Mail, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderConfirmationPageProps {
  orderId: string;
}

export default function OrderConfirmationPage({ orderId }: OrderConfirmationPageProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Show payment modal automatically when page loads
    setShowPaymentModal(true);
  }, []);

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      {/* Payment Contact Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Payment Information
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Please contact us for payment arrangements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-sm font-semibold mb-2">Contact for Payment:</p>
              <p className="text-lg font-mono text-primary mb-1">travis_c1</p>
              <p className="text-xs text-muted-foreground">Snapchat</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-semibold mb-2">Accepted Payment Methods:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Cash</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Venmo</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Contact Snapchat: travis_c1 to receive Venmo payment details. We will review your order and contact you directly to arrange payment.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowPaymentModal(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl mb-2">Order Confirmed!</CardTitle>
          <CardDescription className="text-base md:text-lg">
            Thank you for your order. We've received your request and will begin processing it shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order ID Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-center border border-primary/20">
            <p className="text-sm font-medium text-muted-foreground mb-2">Your Order ID</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-2">{orderId}</p>
            <p className="text-xs text-muted-foreground">
              Please save this ID for your records and future reference
            </p>
          </div>

          <Separator />

          {/* What Happens Next */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              What Happens Next
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Order Review
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your order details and verify all information within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Payment Contact
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    After reviewing your order, we will contact you via Snapchat (travis_c1) to arrange payment. 
                    Contact Snapchat: travis_c1 to receive Venmo payment details. We accept Cash and Venmo.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Production
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Once payment is received, we'll begin producing your custom novelty IDs with professional quality materials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  4
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-semibold text-base mb-1 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Shipping
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your completed novelty IDs (2 copies) will be carefully packaged and shipped to your provided address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Important Information */}
          <div className="bg-muted/50 rounded-lg p-5 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Payment:</strong> Contact Snapchat: travis_c1 to receive Venmo payment details. 
                  We accept Cash and Venmo. Payment is arranged after order review.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Email Confirmation:</strong> You will receive a confirmation email at the address you provided with your order details.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Questions:</strong> If you have any questions about your order, please contact us with your Order ID.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Processing Time:</strong> Novelty ID orders typically take 5-10 business days to produce after payment is received, plus shipping time.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={() => window.location.hash = '#/'} size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
