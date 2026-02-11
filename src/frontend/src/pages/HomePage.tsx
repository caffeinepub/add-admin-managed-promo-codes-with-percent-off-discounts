import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Package, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '../utils/assetPaths';

export default function HomePage() {
  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getAssetUrl('assets/generated/falcon-ids-hero-banner.dim_1600x600.png')}
            alt="Falcon IDs Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Premium Custom ID Cards
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
              High-quality custom identification cards with professional materials and fast turnaround.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate('/order')} className="text-lg px-8 py-6 gap-2">
                Order Now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/prices')} className="text-lg px-8 py-6">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Falcon IDs</h2>
            <p className="text-lg text-muted-foreground">
              We specialize in creating high-quality custom identification cards with professional materials and attention to detail.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Quality Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Professional-grade printing and materials ensure your cards look great and last long.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Fast Turnaround</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Orders are typically processed within 5-10 business days after payment confirmation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">2 Copies Included</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Every order includes 2 identical copies for your convenience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get</h2>
            <p className="text-lg text-muted-foreground">
              Every order includes premium features and quality materials
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <Package className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">2 Copies Included</h3>
              <p className="text-sm text-muted-foreground">
                Every order includes 2 identical copies of your ID
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">All US States</h3>
              <p className="text-sm text-muted-foreground">
                Choose from any US state design for your card
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Custom Photo</h3>
              <p className="text-sm text-muted-foreground">
                Upload your own photo to personalize your ID
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Digital Signature</h3>
              <p className="text-sm text-muted-foreground">
                Add your signature directly on the order form
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get started with your custom ID card today. Simple ordering process, fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/order')} className="text-lg px-8 py-6 gap-2">
                Place Your Order
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/prices')} className="text-lg px-8 py-6">
                See Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
