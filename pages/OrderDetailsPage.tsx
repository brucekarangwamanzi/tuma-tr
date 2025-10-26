import React, { useState, useEffect } from 'react';
import { getOrderById, updateOrderStatus } from '../services/api';
import { Order, Message, User, OrderStatus } from '../types';
import OrderTracker from '../components/OrderTracker';
import { MessageIcon } from '../components/Icons';

interface OrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
  user: User;
  onNavigateToMessages: (orderId: string) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white font-medium">{value || 'N/A'}</p>
    </div>
);

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, onBack, user, onNavigateToMessages }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { order, messages } = await getOrderById(orderId);
        setOrder(order);
        setMessages(messages);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);
  
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
        const updatedOrder = await updateOrderStatus(order.id, newStatus);
        setOrder(updatedOrder); // Update local state
    } catch (error) {
        console.error("Failed to update order status:", error);
        setError("Failed to update status. Please try again.");
    }
  };

  const isEditable = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';


  if (isLoading) {
    return <div className="text-center text-gray-300">Loading order details...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-500/20 text-red-300 rounded-lg">{error}</div>;
  }

  if (!order) {
    return <div className="text-center text-gray-300">Order not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mb-4">&larr; Back to Orders</button>
        <h2 className="text-3xl font-bold text-white">Order Details</h2>
        <p className="text-gray-400">Order ID: {order.id}</p>
      </div>

      {/* Main Order Tracker */}
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <OrderTracker 
            status={order.status} 
            isEditable={isEditable}
            onStatusChange={handleStatusUpdate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Screenshot */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Product Name" value={order.productName} />
                    <DetailItem label="Quantity" value={order.quantity} />
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-400">Product URL</p>
                        <a href={order.productUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">{order.productUrl}</a>
                    </div>
                    <DetailItem label="Variation" value={order.variation} />
                    <DetailItem label="Specifications" value={order.specifications} />
                     <div className="md:col-span-2">
                        <DetailItem label="Additional Notes" value={order.notes} />
                    </div>
                </div>
            </div>
             <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4">Product Screenshot</h3>
                <img src={order.screenshotUrl} alt="Product Screenshot" className="rounded-lg max-w-sm mx-auto" />
            </div>
        </div>

        {/* Right Column: History & Messages */}
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4">Status History</h3>
                <ul className="space-y-3">
                {order.statusHistory.map((history, index) => (
                    <li key={index} className="flex items-start">
                        <div className="w-4 h-4 bg-cyan-500 rounded-full mt-1.5 mr-3 shrink-0 border-2 border-gray-800"></div>
                        <div>
                            <p className="font-semibold text-white">{history.status}</p>
                            <p className="text-xs text-gray-400">{new Date(history.timestamp).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
                </ul>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageIcon className="w-5 h-5" /> Messages</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 flex-grow">
                    {messages.length > 0 ? messages.map(msg => (
                        <div key={msg.id} className={`p-3 rounded-lg ${msg.senderId === user.id ? 'bg-cyan-500/20' : 'bg-gray-700/50'}`}>
                            <p className="text-sm font-bold text-white">{msg.senderFullName}</p>
                            <p className="text-sm text-gray-300">{msg.text}</p>
                            <p className="text-xs text-gray-500 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-400 text-center py-4">No messages for this order yet.</p>
                    )}
                </div>
                 <button 
                    onClick={() => onNavigateToMessages(order.id)}
                    className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Go to Full Conversation
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;