import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import api from '../api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/api/users/wishlist');
      setFoods(response.data.foods);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (foodId) => {
    try {
      await api.delete(`/api/users/wishlist/${foodId}`);
      setFoods(foods.filter(f => f._id !== foodId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (food) => {
    addToCart(food);
    toast.success(`Added ${food.name} to cart`);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-500 fill-current" />
          My Wishlist
        </h1>

        {foods.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">Save your favorite foods for later</p>
            <Link to="/restaurants" className="btn-primary inline-flex items-center">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food, index) => (
              <motion.div
                key={food._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover"
              >
                <div className="relative h-48">
                  <img
                    src={food.image || '/placeholder-food.jpg'}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(food._id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/foods/${food._id}`}>
                    <h3 className="font-bold text-lg mb-1 hover:text-primary-600 transition-colors">
                      {food.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-2">{food.restaurant?.name}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-primary-600">₹{food.price}</span>
                      {food.originalPrice && (
                        <span className="text-gray-400 line-through ml-2">₹{food.originalPrice}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(food)}
                      className="btn-primary px-3 py-2 text-sm flex items-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
