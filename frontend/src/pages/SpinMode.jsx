import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const SpinMode = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSpinDetails();
  }, [restaurantId, isAuthenticated]);

  const fetchSpinDetails = async () => {
    try {
      const response = await axios.get(`/api/spin/restaurant/${restaurantId}`);
      setRestaurant(response.data);
      setItems(response.data.availableItems);
    } catch (error) {
      toast.error('Failed to load spin details');
      navigate('/restaurants');
    }
  };

  const spinWheel = async () => {
    setSpinning(true);
    setResult(null);

    try {
      const response = await axios.post('/api/spin', {
        restaurantId,
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        paymentMethod: 'razorpay'
      });

      const spunFood = response.data.spunFood;
      setResult(response.data);
      setShowConfetti(true);

      // Calculate rotation
      const itemIndex = items.findIndex(item => item._id === spunFood._id);
      const segmentAngle = 360 / items.length;
      const targetAngle = 360 - (itemIndex * segmentAngle) - (segmentAngle / 2);
      const totalRotation = 360 * 5 + targetAngle;

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
      }

      setTimeout(() => {
        setSpinning(false);
        toast.success(`You won ${spunFood.name}!`);
      }, 5000);
    } catch (error) {
      setSpinning(false);
      toast.error(error.response?.data?.message || 'Spin failed');
    }
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const segmentAngle = 360 / items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-12 px-4">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎰 Spin to Win!</h1>
          <p className="text-white/90 text-lg">
            Pay ₹{restaurant.spinPrice} and spin to win a random food item
          </p>
        </motion.div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          {/* Wheel */}
          <div className="relative w-80 h-80 mx-auto mb-8">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400"></div>
            </div>

            {/* Wheel */}
            <motion.div
              ref={wheelRef}
              className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden"
              style={{ transition: 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' }}
            >
              {items.map((item, index) => {
                const rotation = index * segmentAngle;
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={item._id}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.cos((segmentAngle * Math.PI) / 180)}%)`
                    }}
                  >
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: color, transform: `rotate(${segmentAngle / 2}deg)` }}
                    >
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold text-xs text-center w-16">
                        {item.name.substring(0, 10)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center mb-8">
            <button
              onClick={spinWheel}
              disabled={spinning || result}
              className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {spinning ? 'Spinning...' : result ? 'Already Spun!' : `Spin for ₹${restaurant.spinPrice}`}
            </button>
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && !spinning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-4">You won:</p>
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl p-4 mb-4">
                  <h3 className="text-xl font-bold">{result.spunFood.name}</h3>
                  <p className="text-white/90">Original Price: ₹{result.spunFood.price}</p>
                </div>
                {result.savings > 0 && (
                  <p className="text-green-600 font-semibold text-lg">
                    You saved ₹{result.savings}!
                  </p>
                )}
                <button
                  onClick={() => navigate(`/orders/${result.order._id}`)}
                  className="btn-secondary mt-4"
                >
                  Track Order
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Available Items */}
          <div className="mt-8">
            <h3 className="text-white font-semibold mb-4 text-center">Items on the Wheel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🍕</div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-white/70 text-xs">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinMode;
