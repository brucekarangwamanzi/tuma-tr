import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Message, Order } from '../types';
import { mockAllOrdersData, getMessagesByOrderId, sendMessage } from '../services/api';
import { PaperAirplaneIcon, MagnifyingGlassIcon, PaperclipIcon, XMarkIcon, DocumentTextIcon } from '../components/Icons';

interface MessagesPageProps {
  user: User;
  initialConversationId?: string | null; // This will be an orderId
}

const MessagesPage: React.FC<MessagesPageProps> = ({ user, initialConversationId }) => {
  const [conversations, setConversations] = useState<Order[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mock fetching conversations (orders the user is part of)
    const userConversations = mockAllOrdersData.filter(order => 
      user.role !== 'USER' || order.userId === user.id
    );
    setConversations(userConversations);

    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    } else if (userConversations.length > 0) {
      setSelectedConversationId(userConversations[0].id);
    }
  }, [user.id, user.role, initialConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        const fetchedMessages = await getMessagesByOrderId(selectedConversationId);
        setMessages(fetchedMessages);
        setIsLoadingMessages(false);
      };
      fetchMessages();
    }
  }, [selectedConversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentError(null);
    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 5MB for compression
    const MAX_DOC_SIZE_MB = 2;
    const MAX_DOC_SIZE = MAX_DOC_SIZE_MB * 1024 * 1024; // 2MB

    if (file.type.startsWith('image/')) {
        if (file.size > MAX_IMAGE_SIZE) {
            setAttachmentError(`Image must be under ${MAX_IMAGE_SIZE_MB} MB.`);
            return;
        }
    } else { // For documents
        if (file.size > MAX_DOC_SIZE) {
            setAttachmentError(`Document must be under ${MAX_DOC_SIZE_MB} MB.`);
            return;
        }
    }
    setAttachment(file);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedConversationId) return;
  
    setIsSending(true);
    const optimisticId = `optimistic-${Date.now()}`;
    
    // Create optimistic message for instant UI feedback
    const optimisticMessage: Message = {
      id: optimisticId,
      orderId: selectedConversationId,
      senderId: user.id,
      receiverId: '', // Will be set by backend
      senderFullName: user.fullName,
      timestamp: new Date().toISOString(),
    };

    if (newMessage.trim()) {
        optimisticMessage.text = newMessage.trim();
    }
    if (attachment) {
        const localUrl = URL.createObjectURL(attachment);
        if (attachment.type.startsWith('image/')) {
            optimisticMessage.imageUrl = localUrl;
        } else {
            optimisticMessage.docUrl = localUrl;
        }
    }
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    const messageToSend = newMessage.trim();
    const attachmentToSend = attachment;

    setNewMessage('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input

    try {
      const sentMessage = await sendMessage(selectedConversationId, user, messageToSend, attachmentToSend);
      // Replace optimistic message with the real one from the server
      setMessages(prev => prev.map(msg => msg.id === optimisticId ? sentMessage : msg));
      // Clean up the local URL
      if (optimisticMessage.imageUrl || optimisticMessage.docUrl) {
        URL.revokeObjectURL((optimisticMessage.imageUrl || optimisticMessage.docUrl)!);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // On failure, remove the optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c as any).userFullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-[calc(100vh-160px)] bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
      {/* Conversation List */}
      <aside className="w-1/3 xl:w-1/4 border-r border-gray-700/50 flex flex-col">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">Inbox</h2>
          <div className="relative mt-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/80 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => setSelectedConversationId(convo.id)}
              className={`w-full text-left p-4 transition-colors ${selectedConversationId === convo.id ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
            >
              <p className="font-bold text-white truncate">{convo.productName}</p>
              <p className="text-sm text-gray-400">Order ID: {convo.id}</p>
              {user.role !== 'USER' && <p className="text-xs text-gray-500">User: {(convo as any).userFullName}</p>}
            </button>
          ))}
        </div>
      </aside>

      {/* Message View */}
      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <header className="p-4 border-b border-gray-700/50 bg-gray-800/30">
              <h3 className="font-bold text-white truncate">{selectedConversation.productName}</h3>
              <p className="text-sm text-gray-400">
                Conversation about order #{selectedConversation.id}
                {user.role !== 'USER' && ` with ${(selectedConversation as any).userFullName}`}
              </p>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {isLoadingMessages ? (
                <p className="text-center text-gray-400">Loading messages...</p>
              ) : messages.length > 0 ? (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg rounded-lg ${msg.senderId === user.id ? 'bg-cyan-600 text-white' : 'bg-gray-700'}`}>
                      <div className="p-3">
                         <p className="text-sm font-bold">{msg.senderFullName}</p>
                         {msg.text && <p className="text-white whitespace-pre-wrap mt-1">{msg.text}</p>}
                         {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Attachment" className="mt-2 rounded-lg max-w-xs cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} />
                         )}
                         {msg.docUrl && (
                            <a href={msg.docUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 bg-gray-600/50 p-2 rounded-lg hover:bg-gray-600">
                                <DocumentTextIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
                                <span className="text-sm text-white truncate">{attachment?.name || 'Document'}</span>
                            </a>
                         )}
                         <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No messages in this conversation yet.</p>
              )}
               <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                {attachment && (
                    <div className="mb-2 p-2 bg-gray-700/50 rounded-md flex justify-between items-center">
                        <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                        <button onClick={() => { setAttachment(null); setAttachmentError(null); }} className="p-1 rounded-full hover:bg-gray-600">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {attachmentError && <p className="text-red-400 text-xs mb-2">{attachmentError}</p>}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" accept="image/png, image/jpeg, image/webp, application/pdf, .doc, .docx" />
                <label htmlFor="file-upload" className="cursor-pointer p-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <PaperclipIcon className="w-6 h-6 text-gray-400" />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  disabled={isSending}
                />
                <button type="submit" disabled={isSending || (!newMessage.trim() && !attachment)} className="bg-cyan-500 text-white p-3 rounded-lg hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to start messaging.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;