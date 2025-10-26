import { Role, User, Order, OrderStatus, VerificationRequest, SiteContent, Message, Company, HeroMedia } from '../types';

// --- MOCK DATA ---

const mockUsers: { [key: string]: User } = {
  'user@test.com': { id: 'user1', email: 'user@test.com', fullName: 'John Doe', phone: '123456789', role: Role.USER, isVerified: true, createdAt: new Date(2023, 10, 1).toISOString(), totalOrders: 4 },
  'new@test.com': { id: 'user2', email: 'new@test.com', fullName: 'New User', phone: '', role: Role.USER, isVerified: false, createdAt: new Date(2024, 0, 15).toISOString(), totalOrders: 0 },
  'proc@test.com': { id: 'proc1', email: 'proc@test.com', fullName: 'Jane Smith', phone: '987654321', role: Role.ORDER_PROCESSOR, isVerified: true, createdAt: new Date(2023, 5, 20).toISOString(), totalOrders: 0 },
  'admin@test.com': { id: 'admin1', email: 'admin@test.com', fullName: 'Admin Power', phone: '555555555', role: Role.ADMIN, isVerified: true, createdAt: new Date(2023, 2, 10).toISOString(), totalOrders: 0 },
  'super@test.com': { id: 'super1', email: 'super@test.com', fullName: 'Super User', phone: '000000000', role: Role.SUPER_ADMIN, isVerified: true, createdAt: new Date(2022, 1, 1).toISOString(), totalOrders: 0 },
};

export let mockUserOrders: Order[] = [
    { id: 'order1', userId: 'user1', productUrl: 'https://example.com/product/123', productName: 'Ergonomic Office Chair', quantity: 1, variation: 'Black', specifications: 'With headrest', notes: 'Please check quality before shipping.', screenshotUrl: 'https://picsum.photos/seed/chair/400/300', status: OrderStatus.IN_TRANSIT, createdAt: new Date(2024, 0, 10).toISOString(), updatedAt: new Date(2024, 0, 25).toISOString(), statusHistory: [ { status: OrderStatus.REQUESTED, timestamp: new Date(2024, 0, 10).toISOString() }, { status: OrderStatus.PURCHASED, timestamp: new Date(2024, 0, 12).toISOString() }, { status: OrderStatus.IN_WAREHOUSE, timestamp: new Date(2024, 0, 18).toISOString() }, { status: OrderStatus.IN_TRANSIT, timestamp: new Date(2024, 0, 25).toISOString() } ] },
    { id: 'order2', userId: 'user1', productUrl: 'https://example.com/product/456', productName: 'Mechanical Keyboard', quantity: 2, variation: 'RGB, Blue Switches', specifications: '', notes: '', screenshotUrl: 'https://picsum.photos/seed/keyboard/400/300', status: OrderStatus.COMPLETED, createdAt: new Date(2023, 11, 5).toISOString(), updatedAt: new Date(2023, 11, 28).toISOString(), statusHistory: [ { status: OrderStatus.REQUESTED, timestamp: new Date(2023, 11, 5).toISOString() }, { status: OrderStatus.PURCHASED, timestamp: new Date(2023, 11, 6).toISOString() }, { status: OrderStatus.IN_WAREHOUSE, timestamp: new Date(2023, 11, 12).toISOString() }, { status: OrderStatus.IN_TRANSIT, timestamp: new Date(2023, 11, 20).toISOString() }, { status: OrderStatus.ARRIVED, timestamp: new Date(2023, 11, 27).toISOString() }, { status: OrderStatus.COMPLETED, timestamp: new Date(2023, 11, 28).toISOString() } ] },
    { id: 'order3', userId: 'user1', productUrl: 'https://example.com/product/789', productName: '4K Webcam', quantity: 1, screenshotUrl: 'https://picsum.photos/seed/webcam/400/300', status: OrderStatus.DECLINED, createdAt: new Date(2024, 0, 20).toISOString(), updatedAt: new Date(2024, 0, 21).toISOString(), statusHistory: [ { status: OrderStatus.REQUESTED, timestamp: new Date(2024, 0, 20).toISOString() }, { status: OrderStatus.DECLINED, timestamp: new Date(2024, 0, 21).toISOString() } ] },
    { id: 'order4', userId: 'user1', productUrl: 'https://example.com/product/101', productName: 'Wireless Mouse', quantity: 1, screenshotUrl: 'https://picsum.photos/seed/mouse/400/300', status: OrderStatus.REQUESTED, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), statusHistory: [ { status: OrderStatus.REQUESTED, timestamp: new Date().toISOString() } ] },
];

export let mockAllOrdersData = [
  ...mockUserOrders,
  // FIX: Removed userFullName property to ensure type consistency in the array before mapping.
  // The .map function below will add the userFullName to all orders.
  { id: 'order5', userId: 'user2', productUrl: 'https://example.com/product/202', productName: 'Laptop Stand', quantity: 1, variation: 'Silver', specifications: '', notes: '', screenshotUrl: 'https://picsum.photos/seed/stand/400/300', status: OrderStatus.IN_WAREHOUSE, createdAt: new Date(2024, 0, 18).toISOString(), updatedAt: new Date(2024, 0, 22).toISOString(), statusHistory: [ { status: OrderStatus.REQUESTED, timestamp: new Date(2024, 0, 18).toISOString() }, { status: OrderStatus.PURCHASED, timestamp: new Date(2024, 0, 19).toISOString() }, { status: OrderStatus.IN_WAREHOUSE, timestamp: new Date(2024, 0, 22).toISOString() } ] }
].map(o => ({ ...o, userFullName: mockUsers[o.userId as keyof typeof mockUsers]?.fullName || 'Unknown User' }));

const mockVerificationRequests: VerificationRequest[] = [
    { id: 'vr1', userId: 'user2', fullName: 'New User', phone: '+250 788 123 456', govIdUrl: 'https://picsum.photos/seed/id/600/400', selfieUrl: 'https://picsum.photos/seed/selfie/400/400', status: 'PENDING', submittedAt: new Date(2024, 0, 16).toISOString() },
    { id: 'vr2', userId: 'user3-nonexistent', fullName: 'Another User', phone: '+250 788 789 123', govIdUrl: 'https://picsum.photos/seed/id2/600/400', selfieUrl: 'https://picsum.photos/seed/selfie2/400/400', status: 'PENDING', submittedAt: new Date(2024, 0, 17).toISOString() },
];

const mockMessages: { [orderId: string]: Message[] } = {
    'order1': [
        { id: 'msg1', orderId: 'order1', senderId: 'user1', receiverId: 'proc1', senderFullName: 'John Doe', text: 'Hi, any update on my chair?', timestamp: new Date(2024, 0, 24).toISOString() },
        { id: 'msg2', orderId: 'order1', senderId: 'proc1', receiverId: 'user1', senderFullName: 'Jane Smith', text: 'Hello John, it has been dispatched from the warehouse and is on its way. You can track it above.', timestamp: new Date(2024, 0, 25).toISOString() },
    ],
    'order3': [
        { id: 'msg3', orderId: 'order3', senderId: 'proc1', receiverId: 'user1', senderFullName: 'Jane Smith', text: 'Hi John, we had to decline this request as the item is out of stock with the seller. We can look for alternatives if you like.', timestamp: new Date(2024, 0, 21).toISOString() },
    ],
};

let mockSiteContent: SiteContent = {
    aboutUs: { text: "Tuma-Africa Link Cargo is your trusted partner for sourcing and shipping goods from China to Africa. We simplify the entire process, from finding your desired products on platforms like Alibaba and 1688.com to handling logistics and customs, delivering right to your doorstep. Our mission is to bridge the gap between continents, making global commerce accessible and hassle-free for everyone.", mediaUrl: "https://picsum.photos/seed/about-us-cargo/600/400", mediaType: 'image' },
    terms: "These are the terms of service...",
    privacy: "This is the privacy policy...",
    socialLinks: { facebook: "#", twitter: "#", instagram: "#" },
    companies: [
        { id: 'comp1', name: 'Alibaba', logoUrl: 'https://picsum.photos/seed/alibaba/120/60', websiteUrl: '#' },
        { id: 'comp2', name: '1688.com', logoUrl: 'https://picsum.photos/seed/1688/120/60', websiteUrl: '#' },
        { id: 'comp3', name: 'Taobao', logoUrl: 'https://picsum.photos/seed/taobao/120/60', websiteUrl: '#' },
    ],
    heroMedia: [
        { id: 'media1', type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' },
        { id: 'media2', type: 'image', url: 'https://picsum.photos/seed/hero1/1920/1080' },
    ],
    heroDisplayMode: 'video',
    dashboardAnnouncement: { message: 'Welcome to the new Tuma-Africa dashboard! We are currently in beta. Please report any issues.', active: true },
};

// --- MOCK API FUNCTIONS ---

const simulateApi = <T>(data: T, delay = 500): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(() => {
      // FIX: The original implementation threw a JSON parsing error when 'data' was undefined.
      // This check ensures that if undefined is passed in (for void promises), it's resolved correctly
      // without attempting to stringify and parse it.
      if (data === undefined) {
        resolve(undefined as T);
        return;
      }
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay)
  );

export const getSiteContent = async (): Promise<SiteContent> => {
    return simulateApi(mockSiteContent);
};

export const updateSiteContent = async (section: keyof SiteContent, data: any): Promise<void> => {
    console.log(`Updating ${section} with`, data);
    (mockSiteContent as any)[section] = data;
    return simulateApi(undefined, 300);
};

export const submitVerificationRequest = async (data: FormData, user: User): Promise<void> => {
    console.log('Submitting verification for:', user.id, Object.fromEntries(data.entries()));
    const newRequest: VerificationRequest = {
        id: `vr-${Date.now()}`,
        userId: user.id,
        fullName: data.get('fullName') as string,
        phone: data.get('phone') as string,
        govIdUrl: URL.createObjectURL(data.get('govId') as File),
        selfieUrl: URL.createObjectURL(data.get('selfie') as File),
        status: 'PENDING',
        submittedAt: new Date().toISOString()
    };
    mockVerificationRequests.push(newRequest);
    return simulateApi(undefined);
};

export const getPendingVerificationRequests = async (): Promise<VerificationRequest[]> => {
    return simulateApi(mockVerificationRequests.filter(r => r.status === 'PENDING'));
};

export const approveVerificationRequest = async (requestId: string, userId: string): Promise<void> => {
    console.log(`Approving request ${requestId} for user ${userId}`);
    const reqIndex = mockVerificationRequests.findIndex(r => r.id === requestId);
    if (reqIndex > -1) mockVerificationRequests.splice(reqIndex, 1);
    
    const user = Object.values(mockUsers).find(u => u.id === userId);
    if (user) user.isVerified = true;

    return simulateApi(undefined);
};

export const rejectVerificationRequest = async (requestId: string): Promise<void> => {
    console.log(`Rejecting request ${requestId}`);
    const reqIndex = mockVerificationRequests.findIndex(r => r.id === requestId);
    if (reqIndex > -1) mockVerificationRequests.splice(reqIndex, 1); // In a real app, this might be marked as REJECTED instead of removed
    return simulateApi(undefined);
};

export const getUsers = async (): Promise<User[]> => {
    return simulateApi(Object.values(mockUsers));
};

export const updateUserRole = async (userId: string, newRole: Role): Promise<User> => {
    console.log(`Updating role for user ${userId} to ${newRole}`);
    let targetUser: User | undefined;

    for (const key in mockUsers) {
        if (mockUsers[key as keyof typeof mockUsers].id === userId) {
            mockUsers[key as keyof typeof mockUsers].role = newRole;
            targetUser = mockUsers[key as keyof typeof mockUsers];
            break;
        }
    }
    
    if (!targetUser) {
        throw new Error("User not found to update role");
    }

    return simulateApi(targetUser);
};

export const createOrderRequest = async (data: FormData, user: User): Promise<void> => {
    console.log('Creating order for:', user.id, Object.fromEntries(data.entries()));
    const newOrder: Order = {
        id: `order-${Date.now()}`,
        userId: user.id,
        productUrl: data.get('productUrl') as string,
        productName: data.get('productName') as string,
        quantity: parseInt(data.get('quantity') as string, 10),
        variation: data.get('variation') as string,
        specifications: data.get('specifications') as string,
        notes: data.get('notes') as string,
        screenshotUrl: URL.createObjectURL(data.get('screenshot') as File),
        status: OrderStatus.REQUESTED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{ status: OrderStatus.REQUESTED, timestamp: new Date().toISOString() }],
    };
    mockUserOrders.unshift(newOrder); // Add to user's orders
    mockAllOrdersData.unshift({ ...newOrder, userFullName: user.fullName }); // Add to all orders
    return simulateApi(undefined, 1000);
};

export const getOrderById = async (orderId: string): Promise<{ order: Order, messages: Message[] }> => {
    const order = mockAllOrdersData.find(o => o.id === orderId);
    if (!order) {
        throw new Error('Order not found');
    }
    const messages = mockMessages[orderId] || [];
    return simulateApi({ order: { ...order }, messages });
};

// FIX: The `updateOrderStatus` function was causing a type error because the `.map` operation
// on `mockAllOrdersData` could return an `Order` type, which lacks the `userFullName` property.
// I've updated the `update` helper to be generic and changed the `updatedOrder` variable's type
// to correctly preserve the `userFullName` property throughout the update process, resolving the type conflict.
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    let updatedOrder: (Order & { userFullName: string }) | undefined;

    const update = <T extends Order>(order: T): T => {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        // Avoid duplicate history entries if status is unchanged
        const lastHistory = order.statusHistory[order.statusHistory.length - 1];
        if (!lastHistory || lastHistory.status !== status) {
            order.statusHistory.push({ status, timestamp: new Date().toISOString() });
        }
        return order;
    };
    
    mockAllOrdersData = mockAllOrdersData.map(o => {
        if (o.id === orderId) {
            updatedOrder = update({ ...o });
            return updatedOrder;
        }
        return o;
    });

    mockUserOrders = mockUserOrders.map(o => {
        if (o.id === orderId) {
            // Ensure we update with the same timestamp
            const updated = updatedOrder ? { ...updatedOrder } : update({ ...o });
            return updated;
        }
        return o;
    });
    
    if (!updatedOrder) {
        throw new Error("Order not found");
    }

    return simulateApi(updatedOrder);
};


export const getMessagesByOrderId = async (orderId: string): Promise<Message[]> => {
    return simulateApi(mockMessages[orderId] || []);
};

export const sendMessage = async (orderId: string, sender: User, text: string, attachment?: File | null): Promise<Message> => {
    const order = mockAllOrdersData.find(o => o.id === orderId);
    if (!order) throw new Error("Conversation not found");

    // Simplified logic to determine receiver
    const receiverId = sender.role === Role.USER 
        ? 'proc1' // User sends to processor
        : order.userId; // Staff sends to the user of the order

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        orderId,
        senderId: sender.id,
        receiverId,
        senderFullName: sender.fullName,
        timestamp: new Date().toISOString(),
    };

    if (text.trim()) {
        newMessage.text = text.trim();
    }

    if (attachment) {
        if (attachment.type.startsWith('image/')) {
            // On a real backend, you'd use a library like Sharp here.
            if (attachment.size > 40 * 1024) {
                 console.log(`[Mock Backend] Image "${attachment.name}" is over 40KB. Simulating compression with Sharp...`);
                // In a real scenario, the file would be processed, compressed, and stored,
                // and a URL to the stored asset would be returned.
            }
            newMessage.imageUrl = URL.createObjectURL(attachment);
        } else {
            // Handle documents
            newMessage.docUrl = URL.createObjectURL(attachment);
        }
    }

    if (!mockMessages[orderId]) {
        mockMessages[orderId] = [];
    }
    mockMessages[orderId].push(newMessage);
    
    return simulateApi(newMessage);
};