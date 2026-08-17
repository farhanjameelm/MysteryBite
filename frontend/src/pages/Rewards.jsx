import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Coins, Ticket, Users } from 'lucide-react';
import axios from 'axios';

const Rewards = () => {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const [pointsRes, rewardsRes] = await Promise.all([
        axios.get('/api/rewards/points'),
        axios.get('/api/rewards')
      ]);
      setLoyaltyPoints(pointsRes.data.loyaltyPoints);
      setRewards(rewardsRes.data.rewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Rewards & Loyalty</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
          >
            <Coins className="w-10 h-10 mb-3" />
            <h3 className="text-3xl font-bold mb-1">{loyaltyPoints}</h3>
            <p className="text-white/80">Loyalty Points</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white"
          >
            <Gift className="w-10 h-10 mb-3" />
            <h3 className="text-3xl font-bold mb-1">{rewards.length}</h3>
            <p className="text-white/80">Rewards Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
          >
            <Trophy className="w-10 h-10 mb-3" />
            <h3 className="text-3xl font-bold mb-1">{rewards.filter(r => !r.isUsed).length}</h3>
            <p className="text-white/80">Available Rewards</p>
          </motion.div>
        </div>

        {/* How to Earn */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold">Place Orders</p>
                <p className="text-sm text-gray-500">10 points per ₹100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Gift className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold">Mystery Wins</p>
                <p className="text-sm text-gray-500">Bonus points on wins</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-semibold">Referrals</p>
                <p className="text-sm text-gray-500">100 points per referral</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Ticket className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold">Daily Challenges</p>
                <p className="text-sm text-gray-500">Complete for points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Your Rewards</h2>
          
          {rewards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No rewards yet. Start ordering to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    reward.isUsed
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        reward.isUsed ? 'bg-gray-200' : 'bg-green-200'
                      }`}>
                        {reward.type === 'coupon' ? (
                          <Ticket className="w-6 h-6 text-green-600" />
                        ) : (
                          <Coins className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{reward.type}</h3>
                        <p className="text-sm text-gray-500">{reward.description}</p>
                        {reward.coupon && (
                          <p className="text-sm font-mono text-primary-600 mt-1">
                            Code: {reward.coupon.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary-600">
                        {reward.type === 'coupon' ? `₹${reward.value}` : `${reward.value} pts`}
                      </p>
                      <p className={`text-sm ${reward.isUsed ? 'text-gray-400' : 'text-green-600'}`}>
                        {reward.isUsed ? 'Used' : 'Available'}
                      </p>
                      {reward.expiryDate && (
                        <p className="text-xs text-gray-400">
                          Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem Points */}
        <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Redeem Your Points</h2>
              <p className="text-white/90">Convert your loyalty points to wallet balance</p>
            </div>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Redeem Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
