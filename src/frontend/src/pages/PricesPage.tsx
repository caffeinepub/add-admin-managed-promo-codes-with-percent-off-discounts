import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function PricesPage() {
  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const pricingTiers = [
    { quantity: 1, price: 100, total: 100, popular: false },
    { quantity: 2, price: 100, total: 200, popular: false },
    { quantity: 3, price: 100, total: 300, popular: true },
    { quantity: 4, price: 100, total: 400, popular: false },
    { quantity: 5, price: 100, total: 500, popular: false },
  ];

  return (
    <div className="container py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Every ID includes 2 copies. No hidden fees, no surprises.
        </p>
      </div>

      {/* Main Pricing Card */}
      <Card className="border-2 shadow-lg mb-8 max-w-2xl mx-auto">
        <CardHeader className="text-center pb-8">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Package className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl mb-2">$100 per ID</CardTitle>
          <CardDescription className="text-lg">Includes 2 copies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">2 identical copies of your ID</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">Any US state design available</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">Custom photo and signature</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">Professional quality materials</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">5-10 business day production</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">Secure shipping to your address</span>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/order')} className="w-full sm:w-auto text-lg px-8 py-6 gap-2">
              Order Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Examples */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Pricing Examples</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.quantity}
              className={`relative ${tier.popular ? 'border-primary border-2 shadow-lg' : 'border'}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{tier.quantity} ID{tier.quantity > 1 ? 's' : ''}</CardTitle>
                <CardDescription>
                  {tier.quantity * 2} total copies
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-primary">${tier.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ${tier.price} × {tier.quantity}
                  </div>
                </div>
                <Button
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/order')}
                  className="w-full"
                >
                  Order {tier.quantity} ID{tier.quantity > 1 ? 's' : ''}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <Card className="border-2 max-w-3xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Information</CardTitle>
          <CardDescription>How payment works for your order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p>
              <strong className="text-foreground">Payment is collected after order review.</strong> We do not process 
              payment automatically during checkout. This ensures accuracy and prevents errors.
            </p>
            <p>
              After you submit your order, our team will review it and contact you directly via Snapchat to arrange payment.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold">Contact for Payment:</p>
              <p className="text-muted-foreground">Snapchat: <span className="font-mono text-foreground">travis_c1</span></p>
              <Separator className="my-2" />
              <p className="font-semibold">Accepted Payment Methods:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Cash</li>
                <li>Venmo</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Contact Snapchat: travis_c1 to receive Venmo payment details
              </p>
            </div>
            <p className="text-muted-foreground">
              Once payment is confirmed, we'll begin production of your IDs and ship them to your provided address.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why do I get 2 copies?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every order includes 2 identical copies as a backup. This ensures you have a spare in case one gets 
                lost or damaged, providing better value for your purchase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How long does production take?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                After payment is received, production typically takes 5-10 business days. Shipping time varies based 
                on your location but usually adds 3-7 business days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I order more than 5 IDs?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes! For bulk orders of 6 or more IDs, please contact us directly via Snapchat (travis_c1) to discuss 
                pricing and requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What states are available?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We offer designs for all 50 US states. You can select your preferred state design during the order process.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
