import type { Time, OrderStatus, PaymentContactStatus } from '../backend';

/**
 * Format a backend Time (bigint nanoseconds) to a readable date string
 */
export function formatOrderDate(time: Time): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(time / 1000000n);
  const date = new Date(milliseconds);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format order status enum to readable label
 */
export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'shipped':
      return 'Shipped';
    default:
      return 'Unknown';
  }
}

/**
 * Format payment contact status enum to readable label
 */
export function formatPaymentContactStatus(status: PaymentContactStatus): string {
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
}
