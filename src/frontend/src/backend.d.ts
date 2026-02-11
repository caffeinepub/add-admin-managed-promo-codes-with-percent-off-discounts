import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface IDInformation {
    sex: string;
    weight: string;
    height: string;
    signature?: ExternalBlob;
    dateOfBirth: string;
    eyeColor: string;
    photo?: ExternalBlob;
    hairColor: string;
}
export interface ShippingAddress {
    zip: string;
    street: string;
    city: string;
    state: string;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    owner: Principal;
    paymentContactStatus: PaymentContactStatus;
    createdTime: Time;
    email: string;
    shippingAddress: ShippingAddress;
    idInfo: IDInformation;
    phone: string;
    contactNotes: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending"
}
export enum PaymentContactStatus {
    notContacted = "notContacted",
    paymentReceived = "paymentReceived",
    contacted = "contacted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    ensureUserRole(): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrderStatus(orderId: bigint): Promise<OrderStatus | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitOrder(customerName: string, email: string, phone: string, shippingAddress: ShippingAddress, idInfo: IDInformation): Promise<bigint>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updatePaymentContactStatus(orderId: bigint, newStatus: PaymentContactStatus, notes: string): Promise<void>;
}
