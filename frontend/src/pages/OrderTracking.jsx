import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Truck, Package, ChefHat } from 'lucide-react';
import axios from 'axios';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const statusSteps = [
    { key: 'pending', icon: Clock, label: 'Order Placed' },
    { key: 'confirmed', icon: CheckCircle, label: 'Confirmed' },
    { key: 'preparing', icon: ChefHat, label: 'Preparing' },
    { key: 'ready', icon: Package, label: 'Ready' },
    { key: 'out_for_delivery', icon: Truck, label: 'Out for Delivery' },
    { key: 'delivered', icon: CheckCircle, label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">from {order.restaurant?.name}</p>
          </div>

          {/* Progress Tracker */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200"></div>
              <div
                className="absolute top-4 left-0 h-1 bg-primary-600 transition-all duration-500"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              ></div>

              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold text-primary-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">₹{order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="text-gray-600">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
            </p>
          </div>

          {/* Estimated Delivery */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center text-primary-700">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Estimated Delivery: {order.estimatedDeliveryTime}
                </span>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-3">
              {order.orderTimeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium capitalize">{event.status.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;
