import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Clock, CheckCircle, XCircle } from 'lucide-react';

const MysteryMode = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [guessing, setGuessing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchRestaurantFoods();
  }, [restaurantId, isAuthenticated]);

  const fetchRestaurantFoods = async () => {
    try {
      const response = await axios.get(`/api/restaurants/${restaurantId}/foods`);
      setFoods(response.data.foods);
    } catch (error) {
      toast.error('Failed to load foods');
      navigate('/restaurants');
    }
  };

  const startChallenge = async () => {
    if (!selectedFood) {
      toast.error('Please select a food item');
      return;
    }

    try {
      const response = await axios.post('/api/mystery/order', {
        restaurantId,
        orderedFoodId: selectedFood._id,
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        paymentMethod: 'razorpay'
      });

      setChallenge(response.data.challengeId);
      setGuessing(true);
      setStartTime(Date.now());
      toast.success('Mystery challenge started! Your food is on the way');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start challenge');
    }
  };

  const submitGuess = async (guessedFoodId) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await axios.post('/api/mystery/guess', {
        challengeId: challenge,
        guessedFoodId,
        timeTaken
      });

      setResult(response.data);
      setGuessing(false);

      if (response.data.isCorrect) {
        toast.success('🎉 Correct guess! You won a reward!');
      } else {
        toast.error('Wrong guess! Better luck next time');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit guess');
    }
  };

  if (!foods.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎁 Mystery Challenge</h1>
          <p className="text-white/90 text-lg">
            Order a food, get a different one delivered. Guess correctly to win rewards!
          </p>
        </motion.div>

        {!guessing && !result ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Your Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {foods.map((food) => (
                <motion.div
                  key={food._id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedFood(food)}
                  className={`bg-white rounded-2xl overflow-hidden cursor-pointer card-hover ${
                    selectedFood?._id === food._id ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="relative h-48">
                    <img
                      src={food.image || '/placeholder-food.jpg'}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{food.category?.name}</p>
                    <p className="text-xl font-bold text-primary-600">₹{food.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedFood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <p className="text-white mb-4">
                  You selected: <span className="font-bold">{selectedFood.name}</span>
                </p>
                <p className="text-white/80 mb-6">
                  A mystery food from the same category will be delivered instead!
                </p>
                <button onClick={startChallenge} className="btn-primary text-xl px-12 py-4">
                  Start Challenge for ₹{selectedFood.price}
                </button>
              </motion.div>
            )}
          </div>
        ) : guessing ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🚚</div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Mystery Food is on the Way!</h2>
              <p className="text-white/90 mb-6">
                When it arrives, guess what food you received from the options below
              </p>
              <div className="flex items-center justify-center text-white mb-8">
                <Clock className="w-5 h-5 mr-2" />
                <span>Time: {Math.floor((Date.now() - startTime) / 1000)}s</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {foods.slice(0, 4).map((food) => (
                  <motion.button
                    key={food._id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => submitGuess(food._id)}
                    className="bg-white rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-3xl mb-2">🍽️</div>
                    <p className="font-semibold text-gray-900">{food.name}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center"
          >
            <div className="text-6xl mb-4">
              {result.isCorrect ? '🎉' : '😔'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {result.isCorrect ? 'Correct Guess!' : 'Wrong Guess'}
            </h2>
            
            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <p className="text-gray-600 mb-2">The delivered food was:</p>
              <p className="text-2xl font-bold text-primary-600">{result.deliveredFood?.name}</p>
            </div>

            {result.isCorrect ? (
              <div className="bg-green-100 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                  <span className="text-green-600 font-bold text-xl">You Won!</span>
                </div>
                <p className="text-green-700">
                  Reward: ₹{result.rewardValue} discount coupon
                </p>
                <p className="text-green-600 text-sm mt-2">
                  Current Streak: {result.streak} 🔥
                </p>
              </div>
            ) : (
              <div className="bg-red-100 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="w-8 h-8 text-red-600 mr-2" />
                  <span className="text-red-600 font-bold text-xl">Better Luck Next Time!</span>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Link to="/restaurants" className="btn-secondary">
                Try Again
              </Link>
              <Link to="/leaderboard" className="btn-primary">
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default MysteryMode;
