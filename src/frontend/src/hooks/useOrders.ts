import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order, OrderStatus, PaymentContactStatus, ShippingAddress, IDInformation } from '../backend';

// Re-export Order type for use in other components
export type { Order };

// Extended IDInformation type to include name and address
interface ExtendedIDInformation extends Omit<IDInformation, 'photo' | 'signature'> {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  photo?: any;
  signature?: any;
}

interface SubmitOrderParams {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  idInfo: ExtendedIDInformation;
}

export function useSubmitOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitOrderParams) => {
      if (!actor) {
        throw new Error('You must be logged in to place an order. Please log in and try again.');
      }

      // Build the IDInformation object for backend
      const backendIdInfo: IDInformation = {
        height: params.idInfo.height,
        hairColor: params.idInfo.hairColor,
        eyeColor: params.idInfo.eyeColor,
        weight: params.idInfo.weight,
        dateOfBirth: params.idInfo.dateOfBirth,
        sex: params.idInfo.sex,
        photo: params.idInfo.photo,
        signature: params.idInfo.signature,
      };

      return actor.submitOrder(
        params.customerName,
        params.email,
        params.phone,
        params.shippingAddress,
        backendIdInfo
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useUpdatePaymentContactStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
    }: {
      orderId: bigint;
      status: PaymentContactStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updatePaymentContactStatus(orderId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}
