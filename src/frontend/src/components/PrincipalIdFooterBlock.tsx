import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrincipalIdFooterBlock() {
  const { identity } = useInternetIdentity();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Only render when authenticated
  if (!identity) {
    return null;
  }

  const principalId = identity.getPrincipal().toText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-border/40">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
        <span className="text-muted-foreground font-medium">Principal ID:</span>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
          <code className="text-xs font-mono break-all max-w-[300px] sm:max-w-none">
            {principalId}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0 flex-shrink-0"
            aria-label="Copy Principal ID"
          >
            {copyStatus === 'idle' && <Copy className="h-4 w-4" />}
            {copyStatus === 'success' && <Check className="h-4 w-4 text-green-500" />}
            {copyStatus === 'error' && <X className="h-4 w-4 text-destructive" />}
          </Button>
        </div>
        {copyStatus === 'success' && (
          <span className="text-xs text-green-500 font-medium">Copied</span>
        )}
        {copyStatus === 'error' && (
          <span className="text-xs text-destructive font-medium">Copy failed</span>
        )}
      </div>
    </div>
  );
}
