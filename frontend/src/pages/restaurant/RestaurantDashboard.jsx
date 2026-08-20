import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';

const RestaurantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // This would fetch from the restaurant's dashboard API
      // For now, using mock data
      setStats({
        totalOrders: 156,
        completedOrders: 142,
        totalRevenue: 45600,
        monthlyRevenue: 12300,
        rating: { average: 4.5, count: 89 }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurant Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-primary-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
              </div>
              <Package className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats?.totalRevenue?.toFixed(0) || 0}</p>
              </div>
              <DollarSign className="w-12 h-12 text-accent-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.rating?.average?.toFixed(1) || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-2">Manage Menu</h3>
            <p className="text-white/80 mb-4">Add, edit, or remove food items</p>
            <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold">
              Go to Menu
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-2">View Orders</h3>
            <p className="text-white/80 mb-4">Manage incoming orders</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold">
              View Orders
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-white/80 mb-4">View performance metrics</p>
            <button className="bg-white text-accent-600 px-4 py-2 rounded-lg font-semibold">
              View Analytics
            </button>
          </motion.div>
        </div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Revenue chart would go here</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
