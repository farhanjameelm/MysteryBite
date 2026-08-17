import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, MapPin, ArrowRight, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restaurantsRes, foodsRes] = await Promise.all([
        axios.get('/api/restaurants?limit=8'),
        axios.get('/api/foods/popular')
      ]);
      setRestaurants(restaurantsRes.data.restaurants);
      setPopularFoods(foodsRes.data.foods);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-accent-500 to-primary-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Food Delivery with a
              <span className="block text-yellow-300">Twist of Mystery</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Order normally, spin for surprises, or take the mystery challenge!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants or foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg"
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              </div>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Link to="/restaurants" className="group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="text-4xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold mb-2">Safe Mode</h3>
                  <p className="text-white/80 text-sm">Traditional ordering like your favorite apps</p>
                  <ArrowRight className="mt-4 group-hover:translate-x-2 transition-transform" />
                </motion.div>
              </Link>

              <Link to="/spin/demo" className="group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="text-4xl mb-4">🎰</div>
                  <h3 className="text-xl font-bold mb-2">Spin Mode</h3>
                  <p className="text-white/80 text-sm">Spin the wheel to win random food at fixed price</p>
                  <RefreshCw className="mt-4 group-hover:rotate-180 transition-transform" />
                </motion.div>
              </Link>

              <Link to="/mystery/demo" className="group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="text-4xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold mb-2">Mystery Mode</h3>
                  <p className="text-white/80 text-sm">Order one food, get another - guess & win rewards!</p>
                  <Sparkles className="mt-4 group-hover:animate-pulse" />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Restaurants</h2>
            <Link to="/restaurants" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg h-64 skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/restaurants/${restaurant._id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover">
                      <div className="relative h-48">
                        <img
                          src={restaurant.image || '/placeholder-restaurant.jpg'}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                          {restaurant.rating.average.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{restaurant.cuisine.join(', ')}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {restaurant.deliveryInfo.time}
                          <span className="mx-2">•</span>
                          <span className="text-primary-600 font-medium">
                            {restaurant.priceRange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Foods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Trending Foods</h2>
            <Link to="/restaurants" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden h-64 skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularFoods.slice(0, 8).map((food, index) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/foods/${food._id}`}>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden card-hover">
                      <div className="relative h-48">
                        <img
                          src={food.image || '/placeholder-food.jpg'}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                        {food.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {food.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{food.restaurant?.name}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary-600">₹{food.price}</span>
                            {food.originalPrice && (
                              <span className="text-gray-400 line-through ml-2">₹{food.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                            {food.rating.average.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How MysteryBite Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Choose Your Mode</h3>
              <p className="text-gray-400">Select Safe, Spin, or Mystery mode based on your mood</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Place Your Order</h3>
              <p className="text-gray-400">Browse restaurants, add items, and checkout securely</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Enjoy & Earn Rewards</h3>
              <p className="text-gray-400">Get your food delivered and earn loyalty points</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
