import React, { useState, useEffect, useMemo } from 'react';
import { Role, User, Order, OrderStatus, VerificationRequest, SiteContent, Company, HeroMedia } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { GeminiMapsTool, GeminiThinkingTool } from '../components/GeminiTools';
import VerificationForm from '../components/VerificationForm';
import { CheckCircleIcon, ShieldCheckIcon, EyeIcon, XCircleIcon, PackageIcon, MagnifyingGlassIcon, UsersIcon, UploadIcon, PencilIcon, TrashIcon, MegaphoneIcon } from '../components/Icons';
import OrderTracker from '../components/OrderTracker';
import { submitVerificationRequest, getPendingVerificationRequests, approveVerificationRequest, rejectVerificationRequest, getUsers, mockUserOrders, mockAllOrdersData, createOrderRequest, getSiteContent, updateSiteContent, updateOrderStatus, updateUserRole } from '../services/api';
import OrderDetailsPage from './OrderDetailsPage';
import MessagesPage from './MessagesPage';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardHome: React.FC<{ user: User }> = ({ user }) => {
    const [verificationSubmitted, setVerificationSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleVerificationSubmit = async (data: FormData) => {
        setSubmissionError(null);
        try {
            await submitVerificationRequest(data, user);
            setVerificationSubmitted(true);
        } catch (error) {
            if (error instanceof Error) {
                setSubmissionError(error.message);
            } else {
                setSubmissionError('An unknown error occurred during submission.');
            }
        }
    };
    
    const VerificationStatus = () => {
        if (user.isVerified) {
            return (
                 <div className="mt-4 p-4 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg">
                    <strong>Account Verified:</strong> You have full access to all features.
                </div>
            );
        }
        if (verificationSubmitted) {
             return (
                <div className="mt-6 bg-yellow-500/10 p-8 rounded-lg text-center border border-yellow-500/30 flex flex-col items-center">
                    <CheckCircleIcon className="w-16 h-16 text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Information Received!</h2>
                    <p className="text-gray-300 max-w-md">Thanks — we’ve received your info. We’ll check it within 24h and notify you once your account is verified.</p>
                </div>
            );
        }
        return (
            <div className="mt-6">
                 <div className="mb-6 p-4 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-lg">
                    <strong>Account Not Verified:</strong> Please complete your verification to place orders.
                </div>
                {submissionError && (
                    <div className="mb-4 p-4 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg">
                        <strong>Submission Failed:</strong> {submissionError}
                    </div>
                )}
                <VerificationForm userFullName={user.fullName} onSubmit={handleVerificationSubmit} />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/10 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.fullName}!</h2>
                <p className="text-gray-300">Here's a quick overview of your account.</p>
            </div>
            <VerificationStatus />
        </div>
    );
};

const NewOrderForm: React.FC<{ user: User, onOrderPlaced: () => void }> = ({ user, onOrderPlaced }) => {
    const [formData, setFormData] = useState({
        productUrl: '',
        productName: '',
        quantity: '1',
        variation: '',
        specifications: '',
        notes: '',
    });
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.productUrl.trim()) newErrors.productUrl = 'Product URL is required.';
        else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(formData.productUrl)) newErrors.productUrl = 'Please enter a valid URL.';
        if (!formData.productName.trim()) newErrors.productName = 'Product Name is required.';
        if (!formData.quantity || parseInt(formData.quantity) < 1) newErrors.quantity = 'Quantity must be at least 1.';
        if (!screenshotFile) newErrors.screenshot = 'A screenshot is required.';
        else if (screenshotFile.size > 40 * 1024) newErrors.screenshot = 'Screenshot file size must not exceed 40 KB.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshotFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage(null);
        
        const submissionData = new FormData();
        // FIX: Replaced Object.entries loop with explicit appends to avoid type inference issues.
        // This ensures that all values passed to formData.append are correctly typed as strings or Blobs.
        submissionData.append('productUrl', formData.productUrl);
        submissionData.append('productName', formData.productName);
        submissionData.append('quantity', formData.quantity);
        submissionData.append('variation', formData.variation);
        submissionData.append('specifications', formData.specifications);
        submissionData.append('notes', formData.notes);
        submissionData.append('screenshot', screenshotFile!);

        try {
            await createOrderRequest(submissionData, user);
            setSuccessMessage('We are going to find this product for you shortly… Murakoze…');
            // Reset form
            setFormData({ productUrl: '', productName: '', quantity: '1', variation: '', specifications: '', notes: '' });
            setScreenshotFile(null);
            // Redirect after a delay
            setTimeout(() => {
                onOrderPlaced();
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setErrors({ form: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="bg-green-500/10 p-8 rounded-lg text-center border border-green-500/30 flex flex-col items-center">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                <p className="text-gray-300 max-w-md">{successMessage}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200/20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Place Your Order Request</h2>
            <p className="text-gray-300 mb-6">Fill in the details below. We'll handle the rest.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Product URL*</label>
                        <input type="url" name="productUrl" value={formData.productUrl} onChange={handleInputChange} className={`mt-1 w-full p-2 bg-gray-700/50 rounded border ${errors.productUrl ? 'border-red-500' : 'border-gray-600'} focus:ring-cyan-500 focus:border-cyan-500`} />
                        {errors.productUrl && <p className="text-red-400 text-xs mt-1">{errors.productUrl}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Product Name*</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} className={`mt-1 w-full p-2 bg-gray-700/50 rounded border ${errors.productName ? 'border-red-500' : 'border-gray-600'} focus:ring-cyan-500 focus:border-cyan-500`} />
                        {errors.productName && <p className="text-red-400 text-xs mt-1">{errors.productName}</p>}
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Quantity*</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className={`mt-1 w-full p-2 bg-gray-700/50 rounded border ${errors.quantity ? 'border-red-500' : 'border-gray-600'} focus:ring-cyan-500 focus:border-cyan-500`} />
                    {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" name="variation" value={formData.variation} onChange={handleInputChange} placeholder="Variation (e.g., Color, Size)" className="w-full p-2 bg-gray-700/50 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                    <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} placeholder="Specifications (Optional)" rows={1} className="w-full p-2 bg-gray-700/50 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional Notes (Optional)" rows={2} className="w-full p-2 bg-gray-700/50 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                 <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Screenshot (≤ 40 KB)*</label>
                  <label htmlFor="screenshot-upload" className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md cursor-pointer transition-colors ${errors.screenshot ? 'border-red-500 bg-red-500/10' : 'border-gray-500 bg-gray-700/50'} border hover:bg-gray-600/50`}>
                      <UploadIcon className="w-5 h-5" />
                      <span className="text-sm truncate">{screenshotFile ? screenshotFile.name : 'Choose file...'}</span>
                  </label>
                  <input type="file" id="screenshot-upload" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
                  {errors.screenshot && <p className="text-red-400 text-xs mt-1">{errors.screenshot}</p>}
              </div>
              {errors.form && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-md">{errors.form}</p>}
              <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
        </div>
    );
};

const OrderFilters: React.FC<{
  filter: string;
  setFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  idPrefix: string;
}> = ({ filter, setFilter, sortBy, setSortBy, idPrefix }) => (
    <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center">
            <label htmlFor={`${idPrefix}-status-filter`} className="text-sm text-gray-400 mr-2 shrink-0">Filter by:</label>
            <select
                id={`${idPrefix}-status-filter`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-gray-700/80 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-3 py-2 text-sm"
            >
                <option value="All">All Statuses</option>
                {Object.values(OrderStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center">
            <label htmlFor={`${idPrefix}-sort-by`} className="text-sm text-gray-400 mr-2 shrink-0">Sort by:</label>
            <select
                id={`${idPrefix}-sort-by`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700/80 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-3 py-2 text-sm"
            >
                <option value="newest">Date (Newest)</option>
                <option value="oldest">Date (Oldest)</option>
                <option value="status">Status</option>
            </select>
        </div>
    </div>
);


const UserOrders: React.FC<{ onViewDetails: (orderId: string) => void }> = ({ onViewDetails }) => {
    const [filter, setFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const processedOrders = useMemo(() => {
        let orders = mockUserOrders.filter(order => {
            if (filter === 'All') return true;
            return order.status === filter;
        });

        const statusOrder = Object.values(OrderStatus);
        orders.sort((a, b) => {
            switch (sortBy) {
                case 'status':
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return orders;
    }, [filter, sortBy]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Your Orders</h2>
                <OrderFilters 
                    filter={filter}
                    setFilter={setFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    idPrefix="user-order"
                />
            </div>

            {processedOrders.length > 0 ? processedOrders.map(order => (
                <button 
                    key={order.id} 
                    onClick={() => onViewDetails(order.id)}
                    className="w-full text-left bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-md hover:bg-gray-800/80 hover:border-cyan-500/50 transition duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-cyan-400">{order.productName}</h3>
                            <p className="text-sm text-gray-400">Order ID: {order.id}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === OrderStatus.COMPLETED ? 'bg-green-500/20 text-green-300' :
                            order.status === OrderStatus.DECLINED ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    <OrderTracker status={order.status} />
                </button>
            )) : (
                <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <PackageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Orders Found</h3>
                    <p className="text-gray-400">There are no orders matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

const AllOrders: React.FC<{ onViewDetails: (orderId: string) => void, user: User }> = ({ onViewDetails, user }) => {
    const [allOrders, setAllOrders] = useState(mockAllOrdersData);
    const [filter, setFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, sortBy, searchQuery]);
    
    const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, status);
            setAllOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
        } catch (error) {
            console.error("Failed to update status", error);
            // In a real app, you'd show a toast notification
        }
    };

    const isEditable = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN || user.role === Role.ORDER_PROCESSOR;

    const filteredAndSortedOrders = useMemo(() => {
        let orders = allOrders.filter(order => {
            const searchLower = searchQuery.toLowerCase();
            if (searchQuery &&
                !order.id.toLowerCase().includes(searchLower) &&
                !order.userFullName.toLowerCase().includes(searchLower) &&
                !order.productName.toLowerCase().includes(searchLower)
            ) {
                return false;
            }

            if (filter === 'All') return true;
            return order.status === filter;
        });

        const statusOrder = Object.values(OrderStatus);
        orders.sort((a, b) => {
            switch (sortBy) {
                case 'status':
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return orders;
    }, [allOrders, filter, sortBy, searchQuery]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedOrders, currentPage]);


    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-auto">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by ID, product, or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                </div>
                <OrderFilters 
                    filter={filter}
                    setFilter={setFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    idPrefix="all-order"
                />
            </div>
            <h2 className="text-3xl font-bold text-white">All User Orders</h2>

            {filteredAndSortedOrders.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {paginatedOrders.map(order => (
                            <div 
                                key={order.id} 
                                className="w-full text-left bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-md"
                            >
                                <div 
                                    onClick={() => onViewDetails(order.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-cyan-400">{order.productName}</h3>
                                            <p className="text-sm text-gray-400">Order ID: {order.id}</p>
                                            <p className="text-sm text-gray-500 mt-1">User: {order.userFullName} ({order.userId})</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            order.status === OrderStatus.COMPLETED ? 'bg-green-500/20 text-green-300' :
                                            order.status === OrderStatus.DECLINED ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <OrderTracker 
                                    status={order.status} 
                                    isEditable={isEditable}
                                    onStatusChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                                />
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Previous
                            </button>
                            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                 <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <PackageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Orders Found</h3>
                    <p className="text-gray-400">There are no orders matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

const UserManagement: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'fullName' | 'totalOrders' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err) {
                setError('Failed to fetch user data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: Role) => {
        try {
            const updatedUser = await updateUserRole(userId, newRole);
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
        } catch (error) {
            console.error("Failed to update user role:", error);
            setError("Failed to update role. Please try again.");
        }
    };
    
    const assignableRoles = [Role.USER, Role.ORDER_PROCESSOR, Role.ADMIN];

    const processedUsers = useMemo(() => {
        let filtered = users.filter(user =>
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB as string).toLowerCase();
            }
            
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [users, searchQuery, sortKey, sortOrder]);

    if (isLoading) return <div className="text-center text-gray-400">Loading users...</div>;
    if (error) return <div className="p-4 bg-red-500/20 text-red-300 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">User Management</h2>
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-72 pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
            </div>
            
            <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => { setSortKey('totalOrders'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                                Total Orders {sortKey === 'totalOrders' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Manage Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {processedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{user.fullName}</div>
                                    <div className="text-sm text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isVerified ? (
                                        <div className="inline-flex items-center gap-2 text-green-400 font-medium text-sm">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Verified</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-yellow-400 font-medium text-sm">
                                            <XCircleIcon className="w-5 h-5" />
                                            <span>Not Verified</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center font-bold">{user.totalOrders}</td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    {user.role === Role.SUPER_ADMIN || user.id === currentUser.id ? (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === Role.SUPER_ADMIN ? 'bg-red-500/30 text-red-300' : 'bg-gray-500/30 text-gray-300'}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                            className="bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-2 py-1 text-xs"
                                        >
                                            {assignableRoles.map(role => (
                                                <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {processedUsers.length === 0 && (
                     <div className="text-center py-10">
                         <UsersIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                         <h3 className="text-lg font-bold text-white">No Users Found</h3>
                         <p className="text-gray-400 text-sm">No users match your current search query.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};


const Verifications: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            try {
                const data = await getPendingVerificationRequests();
                setRequests(data);
            } catch (err) {
                setError('Failed to fetch verification requests.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredRequests = useMemo(() => {
        return requests.filter(req =>
            req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.userId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requests, searchQuery]);

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

    const handleAction = async (action: 'approve' | 'reject', requestId: string, userId: string) => {
        // Optimistically update UI
        setRequests(prev => prev.filter(req => req.id !== requestId));

        try {
            if (action === 'approve') {
                await approveVerificationRequest(requestId, userId);
            } else {
                await rejectVerificationRequest(requestId);
            }
        } catch (err) {
            setError(`Failed to ${action} request. Please refresh and try again.`);
            // In a real app, you'd re-fetch the list or add the item back to the UI upon failure.
        }
    };

    if (isLoading) return <div className="text-center text-gray-400">Loading verification requests...</div>;
    if (error) return <div className="p-4 bg-red-500/20 text-red-300 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-white">Pending Verifications</h2>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-72 pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                </div>
            </div>

            {paginatedRequests.length === 0 ? (
                <div className="text-center py-10 bg-gray-800/50 rounded-lg">
                    <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white">
                        {searchQuery ? 'No Results Found' : 'All Clear!'}
                    </h3>
                    <p className="text-gray-400">
                        {searchQuery
                            ? `No pending requests match "${searchQuery}".`
                            : 'There are no pending verification requests.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginatedRequests.map(req => (
                            <div key={req.id} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 shadow-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-cyan-400">{req.fullName}</h3>
                                        <p className="text-sm text-gray-400"><strong>Phone:</strong> {req.phone}</p>
                                        <p className="text-sm text-gray-400"><strong>User ID:</strong> {req.userId}</p>
                                        <p className="text-xs text-gray-500"><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4 md:justify-center">
                                        <a href={req.govIdUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
                                            <EyeIcon className="w-5 h-5"/> <span>Govt. ID</span>
                                        </a>
                                        <a href={req.selfieUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
                                            <EyeIcon className="w-5 h-5"/> <span>Selfie</span>
                                        </a>
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <button onClick={() => handleAction('reject', req.id, req.userId)} className="px-4 py-2 rounded-md bg-red-500/80 hover:bg-red-500 text-white font-semibold transition-colors flex items-center gap-2">
                                            <XCircleIcon className="w-5 h-5" /> <span>Reject</span>
                                        </button>
                                        <button onClick={() => handleAction('approve', req.id, req.userId)} className="px-4 py-2 rounded-md bg-green-500/80 hover:bg-green-500 text-white font-semibold transition-colors flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5" /> <span>Approve</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Previous
                            </button>
                            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


const SiteManagement: React.FC = () => {
    const [content, setContent] = useState<SiteContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const data = await getSiteContent();
            setContent(data);
        } catch (err) {
            setError("Failed to load site content.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchContent();
    }, []);

    const handleUpdate = async (section: keyof SiteContent, data: any) => {
        try {
            await updateSiteContent(section, data);
            // Refresh content after update
            await fetchContent();
            alert(`${section} updated successfully!`);
        } catch (err) {
            alert(`Failed to update ${section}. Please try again.`);
        }
    };
    
    if (isLoading) return <div className="text-center">Loading site content...</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!content) return null;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Site Content Management</h2>
            
            {/* Announcement Section */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MegaphoneIcon className="w-5 h-5 text-cyan-400" /> Dashboard Announcement</h3>
                 <div className="space-y-4">
                    <input 
                        type="text"
                        defaultValue={content.dashboardAnnouncement.message}
                        onBlur={(e) => handleUpdate('dashboardAnnouncement', { ...content.dashboardAnnouncement, message: e.target.value })}
                        placeholder="Announcement message..."
                        className="w-full p-2 bg-gray-700/50 rounded border border-gray-600"
                    />
                    <div className="flex items-center gap-4">
                        <label className="text-gray-300">Status:</label>
                        <button
                            onClick={() => handleUpdate('dashboardAnnouncement', { ...content.dashboardAnnouncement, active: !content.dashboardAnnouncement.active })}
                            className={`px-4 py-2 rounded-md text-sm font-bold ${content.dashboardAnnouncement.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {content.dashboardAnnouncement.active ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                 </div>
            </div>

            {/* About Us Section */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4">About Us Section</h3>
                <textarea
                    rows={5}
                    defaultValue={content.aboutUs.text}
                    onBlur={(e) => handleUpdate('aboutUs', { ...content.aboutUs, text: e.target.value })}
                    className="w-full p-2 bg-gray-700/50 rounded border border-gray-600"
                />
                 <p className="text-sm text-gray-400 mt-2">Media URL (Image or Video):</p>
                 <input 
                    type="text"
                    defaultValue={content.aboutUs.mediaUrl}
                     onBlur={(e) => handleUpdate('aboutUs', { ...content.aboutUs, mediaUrl: e.target.value })}
                    className="w-full p-2 bg-gray-700/50 rounded border border-gray-600 mt-1"
                />
            </div>

             {/* Companies Section */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4">"Our Companies" Section</h3>
                <div className="space-y-2">
                    {content.companies.map((company, index) => (
                        <div key={company.id} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded">
                            <img src={company.logoUrl} alt={company.name} className="w-16 h-8 object-contain bg-white rounded-sm p-1"/>
                            <input type="text" defaultValue={company.name} onBlur={(e) => {
                                const updatedCompanies = [...content.companies];
                                updatedCompanies[index].name = e.target.value;
                                handleUpdate('companies', updatedCompanies);
                            }} className="flex-1 p-1 bg-gray-600/50 rounded border border-gray-500" />
                             <input type="text" defaultValue={company.websiteUrl} onBlur={(e) => {
                                const updatedCompanies = [...content.companies];
                                updatedCompanies[index].websiteUrl = e.target.value;
                                handleUpdate('companies', updatedCompanies);
                            }} className="flex-1 p-1 bg-gray-600/50 rounded border border-gray-500" />
                            <button onClick={() => {
                                const updatedCompanies = content.companies.filter(c => c.id !== company.id);
                                handleUpdate('companies', updatedCompanies);
                            }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                 <button onClick={() => {
                    const newCompany = { id: `comp-${Date.now()}`, name: 'New Company', logoUrl: 'https://picsum.photos/120/60', websiteUrl: '#' };
                    handleUpdate('companies', [...content.companies, newCompany]);
                }} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md text-sm">Add Company</button>
            </div>

            {/* Other Sections */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Social Links */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 space-y-3">
                     <h3 className="text-xl font-bold mb-4">Social Media Links</h3>
                     <div>
                        <label className="text-sm text-gray-400">Facebook URL</label>
                        <input type="text" defaultValue={content.socialLinks.facebook} onBlur={(e) => handleUpdate('socialLinks', {...content.socialLinks, facebook: e.target.value })} className="w-full mt-1 p-2 bg-gray-700/50 rounded border border-gray-600"/>
                     </div>
                      <div>
                        <label className="text-sm text-gray-400">Twitter URL</label>
                        <input type="text" defaultValue={content.socialLinks.twitter} onBlur={(e) => handleUpdate('socialLinks', {...content.socialLinks, twitter: e.target.value })} className="w-full mt-1 p-2 bg-gray-700/50 rounded border border-gray-600"/>
                     </div>
                      <div>
                        <label className="text-sm text-gray-400">Instagram URL</label>
                        <input type="text" defaultValue={content.socialLinks.instagram} onBlur={(e) => handleUpdate('socialLinks', {...content.socialLinks, instagram: e.target.value })} className="w-full mt-1 p-2 bg-gray-700/50 rounded border border-gray-600"/>
                     </div>
                </div>

                 {/* Legal */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 space-y-3">
                    <h3 className="text-xl font-bold mb-4">Legal Content</h3>
                    <div>
                        <label className="text-sm text-gray-400">Terms of Service</label>
                        <textarea rows={3} defaultValue={content.terms} onBlur={(e) => handleUpdate('terms', e.target.value)} className="w-full mt-1 p-2 bg-gray-700/50 rounded border border-gray-600"/>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Privacy Policy</label>
                        <textarea rows={3} defaultValue={content.privacy} onBlur={(e) => handleUpdate('privacy', e.target.value)} className="w-full mt-1 p-2 bg-gray-700/50 rounded border border-gray-600"/>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [initialMessageTargetId, setInitialMessageTargetId] = useState<string | null>(null);

  const handleViewOrderDetails = (orderId: string) => {
      setSelectedOrderId(orderId);
      setActiveView('order_details');
  };

  const handleNavigateToMessages = (orderId: string) => {
    setInitialMessageTargetId(orderId);
    setActiveView('messages');
  };
  
  const handleViewChange = (view: string) => {
    // Reset message target when navigating away from a specific context
    if (view !== 'messages') {
        setInitialMessageTargetId(null);
    }
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome user={user} />;
      
      // User Views
      case 'orders':
        if (user.role === Role.USER) return <UserOrders onViewDetails={handleViewOrderDetails} />;
        return <AllOrders user={user} onViewDetails={handleViewOrderDetails} />;
      case 'new_order':
        if (user.role === Role.USER) {
          if (!user.isVerified) {
            return (
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center max-w-lg mx-auto">
                    <ShieldCheckIcon className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                    <h3 className="text-xl font-bold text-yellow-300">Verification Required</h3>
                    <p className="text-yellow-400 mt-2">You must verify your account before you can place a new order.</p>
                    <button onClick={() => setActiveView('dashboard')} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors">
                        Go to Verification
                    </button>
                </div>
            );
          }
          return <NewOrderForm user={user} onOrderPlaced={() => setActiveView('orders')} />;
        }
        return <DashboardHome user={user}/>;
      case 'order_details':
        if (!selectedOrderId) return <UserOrders onViewDetails={handleViewOrderDetails} />; // Fallback
        return <OrderDetailsPage orderId={selectedOrderId} onBack={() => setActiveView('orders')} user={user} onNavigateToMessages={handleNavigateToMessages} />;
      case 'messages':
        return <MessagesPage user={user} initialConversationId={initialMessageTargetId} />;
      case 'gemini_maps':
        return <GeminiMapsTool />;

      // Admin/Super Admin Views
      case 'users':
        if(user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return <UserManagement currentUser={user} />;
        return <DashboardHome user={user}/>
      case 'verifications':
        if(user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return <Verifications />;
        return <DashboardHome user={user}/>
      case 'cms':
        if (user.role === Role.SUPER_ADMIN) return <SiteManagement />;
        return <DashboardHome user={user} />;
      case 'gemini_thinking':
          return <GeminiThinkingTool />;

      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <DashboardLayout 
        userRole={user.role} 
        activeView={activeView} 
        setActiveView={handleViewChange}
        onLogout={onLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;