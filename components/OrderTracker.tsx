import React from 'react';
import { OrderStatus } from '../types';
import {
    ClipboardListIcon,
    ShoppingCartIcon,
    ArchiveBoxIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    CheckCircleIcon,
    XCircleIcon,
} from './Icons';

interface OrderTrackerProps {
  status: OrderStatus;
  isEditable?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

const statusSteps = [
  OrderStatus.REQUESTED,
  OrderStatus.PURCHASED,
  OrderStatus.IN_WAREHOUSE,
  OrderStatus.IN_TRANSIT,
  OrderStatus.ARRIVED,
  OrderStatus.COMPLETED,
];

const statusIcons: { [key in OrderStatus]: React.ElementType } = {
    [OrderStatus.REQUESTED]: ClipboardListIcon,
    [OrderStatus.PURCHASED]: ShoppingCartIcon,
    [OrderStatus.IN_WAREHOUSE]: ArchiveBoxIcon,
    [OrderStatus.IN_TRANSIT]: TruckIcon,
    [OrderStatus.ARRIVED]: BuildingStorefrontIcon,
    [OrderStatus.COMPLETED]: CheckCircleIcon,
    [OrderStatus.DECLINED]: XCircleIcon,
};

const OrderTracker: React.FC<OrderTrackerProps> = ({ status, isEditable = false, onStatusChange }) => {
    const currentStatusIndex = statusSteps.indexOf(status);

    if (status === OrderStatus.DECLINED) {
        const Icon = statusIcons[status];
        return (
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <Icon className="w-8 h-8 text-red-400" />
                <div>
                    <h4 className="font-bold text-red-300">Order Declined</h4>
                    <p className="text-sm text-gray-400">Unfortunately, this order request has been declined. Please check your inbox for a message from our team with more details.</p>
                </div>
            </div>
        )
    }
    
    const WrapperComponent = isEditable ? 'button' : 'div';

    return (
        <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
                const isCompleted = currentStatusIndex > index;
                const isCurrent = currentStatusIndex === index;
                const Icon = statusIcons[step];
                
                return (
                    <React.Fragment key={step}>
                        <WrapperComponent
                             onClick={isEditable ? () => onStatusChange?.(step) : undefined}
                             disabled={isEditable && isCurrent}
                             className={`flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-lg p-1 ${
                                isEditable ? 'cursor-pointer transform transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:scale-100' : ''
                             }`}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${isCompleted ? 'bg-cyan-500' : ''}
                                ${isCurrent ? 'bg-cyan-500 ring-4 ring-cyan-500/50' : ''}
                                ${!isCompleted && !isCurrent ? 'bg-gray-700' : ''}
                            `}>
                                <Icon className={`w-6 h-6 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <p className={`
                                mt-2 text-xs font-semibold
                                ${isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}
                            `}>
                                {step.split(' ')[0]}
                            </p>
                        </WrapperComponent>
                        {index < statusSteps.length - 1 && (
                            <div className={`
                                flex-1 h-1 mx-2
                                ${isCompleted ? 'bg-cyan-500' : 'bg-gray-700'}
                            `}/>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default OrderTracker;