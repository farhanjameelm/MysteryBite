import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingCart, Heart, ArrowLeft, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const FoodDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const response = await axios.get(`/api/foods/${id}`);
      setFood(response.data.food);
    } catch (error) {
      console.error('Error fetching food:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(food, quantity);
    toast.success(`Added ${quantity} ${food.name}(s) to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!food) {
    return <div className="min-h-screen flex items-center justify-center">Food not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/restaurants/${food.restaurant._id}`} className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Restaurant
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative h-96">
            <img
              src={food.image || '/placeholder-food.jpg'}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            {food.discount > 0 && (
              <div className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold">
                {food.discount}% OFF
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{food.name}</h1>
                <p className="text-gray-500">{food.restaurant?.name}</p>
              </div>
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 mr-1 fill-current" />
                <span className="font-semibold">{food.rating.average.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{food.description}</p>

            {/* Dietary Info */}
            <div className="flex flex-wrap gap-2 mb-6">
              {food.dietary.map(d => (
                <span key={d} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {d}
                </span>
              ))}
              {food.spiceLevel && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {food.spiceLevel}
                </span>
              )}
            </div>

            {/* Nutrition Info */}
            {food.nutritionInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-3">Nutrition Information</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{food.nutritionInfo.calories}</p>
                    <p className="text-xs text-gray-500">Calories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{food.nutritionInfo.protein}</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{food.nutritionInfo.carbs}</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{food.nutritionInfo.fat}</p>
                    <p className="text-xs text-gray-500">Fat</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map(ing => (
                    <span key={ing} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-primary-600">₹{food.price}</span>
                  {food.originalPrice && (
                    <>
                      <span className="text-gray-400 line-through ml-2 text-xl">₹{food.originalPrice}</span>
                      <span className="text-green-600 ml-2 text-sm">
                        Save ₹{food.originalPrice - food.price}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn-primary flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{food.preparationTime || '15-20 mins'}</span>
                </div>
                <div className="flex items-center">
                  <span>Serves: {food.servingSize || '1 person'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
