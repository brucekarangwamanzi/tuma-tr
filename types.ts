// FIX: Removed circular self-import of 'Role' which was causing a conflict with its own declaration.
export enum Role {
  USER = 'USER',
  ORDER_PROCESSOR = 'ORDER_PROCESSOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum OrderStatus {
  REQUESTED = 'Requested',
  PURCHASED = 'Purchased in China',
  IN_WAREHOUSE = 'In Warehouse',
  IN_TRANSIT = 'In Ship/Airplane',
  ARRIVED = 'Arrived in Rwanda',
  COMPLETED = 'Delivered / Completed',
  DECLINED = 'Declined'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  totalOrders: number;
}

export interface Order {
  id: string;
  userId: string;
  productUrl: string;
  productName: string;
  quantity: number;
  variation?: string;
  specifications?: string;
  notes?: string;
  screenshotUrl: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: OrderStatus; timestamp: string }[];
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  senderFullName: string;
  text?: string;
  imageUrl?: string;
  docUrl?: string;
  videoUrl?: string;
  timestamp: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  govIdUrl: string;
  selfieUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface HeroMedia {
  id: string;
  type: 'video' | 'image';
  url: string;
}

export interface SiteContent {
  aboutUs: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  };
  terms: string;
  privacy: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  companies: Company[];
  heroMedia: HeroMedia[];
  heroDisplayMode: 'video' | 'slideshow';
  dashboardAnnouncement: {
    message: string;
    active: boolean;
  };
}