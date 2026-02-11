import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';
import LoginButton from './LoginButton';

export default function LoginRequiredScreen() {
  return (
    <div className="container py-12 max-w-2xl">
      <Card className="shadow-lg border-2">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Login Required</CardTitle>
            <CardDescription className="text-base">
              You must be logged in to place an order
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary" />
              Why do I need to log in?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We require authentication to process your order securely and allow you to track your order status. 
              Your login is secure and private using Internet Identity.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <LoginButton />
            <p className="text-xs text-muted-foreground text-center max-w-md">
              By logging in, you'll be able to place orders and view your order history
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
