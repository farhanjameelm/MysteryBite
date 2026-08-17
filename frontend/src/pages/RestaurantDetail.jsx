import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, Heart, ShoppingCart, Filter } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      const [restaurantRes, foodsRes] = await Promise.all([
        axios.get(`/api/restaurants/${id}`),
        axios.get(`/api/restaurants/${id}/foods`)
      ]);
      setRestaurant(restaurantRes.data.restaurant);
      setFoods(foodsRes.data.foods);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category?._id === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(foods.map(f => f.category?._id))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-72 bg-gradient-to-r from-primary-600 to-accent-600">
        <img
          src={restaurant.coverImage || restaurant.image || '/placeholder-restaurant.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-white/90 mb-4">{restaurant.cuisine.join(', ')}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1 fill-current" />
                  <span className="font-semibold">{restaurant.rating.average.toFixed(1)}</span>
                  <span className="ml-1 text-white/70">({restaurant.rating.count} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  {restaurant.deliveryInfo.time}
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">{restaurant.priceRange}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-sm">Delivery Time</span>
                </div>
                <p className="font-semibold text-lg">{restaurant.deliveryInfo.time}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-sm">Delivery Fee</span>
                </div>
                <p className="font-semibold text-lg">₹{restaurant.deliveryInfo.fee}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-sm">Min Order</span>
                </div>
                <p className="font-semibold text-lg">₹{restaurant.deliveryInfo.minimumOrder}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(catId => {
                    const cat = foods.find(f => f.category?._id === catId)?.category;
                    return cat ? (
                      <option key={catId} value={catId}>{cat.name}</option>
                    ) : null;
                  })}
                </select>
              </div>
            </div>

            {/* Food Menu */}
            <div className="space-y-4">
              {filteredFoods.map((food, index) => (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={food.image || '/placeholder-food.jpg'}
                        alt={food.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{food.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            {food.dietary.map(d => (
                              <span key={d} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          {food.discount > 0 && (
                            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                              {food.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-xl font-bold text-primary-600">₹{food.price}</span>
                          {food.originalPrice && (
                            <span className="text-gray-400 line-through ml-2">₹{food.originalPrice}</span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(food)}
                          className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredFoods.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No foods found matching your criteria
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Restaurant Info</h3>
              <div className="space-y-3">
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{restaurant.address.street}, {restaurant.address.city}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{restaurant.contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Gamification Modes */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Try Our Special Modes</h3>
              <div className="space-y-3">
                <Link to={`/spin/${id}`} className="block bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎰</span>
                    <div>
                      <p className="font-semibold">Spin Mode</p>
                      <p className="text-sm text-white/80">Spin to win random food</p>
                    </div>
                  </div>
                </Link>
                <Link to={`/mystery/${id}`} className="block bg-white/20 rounded-lg p-3 hover:bg-white/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="font-semibold">Mystery Mode</p>
                      <p className="text-sm text-white/80">Guess & win rewards</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
