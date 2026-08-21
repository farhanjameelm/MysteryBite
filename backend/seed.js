require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Restaurant = require('./models/Restaurant');
const Food = require('./models/Food');

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected.');

    // Clear only demo/catalog data
    await Food.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});

    // Keep existing users unless we need to create our demo owner
    let owner = await User.findOne({
      email: 'demoowner@mysterybite.com'
    }).select('+password');

    if (!owner) {
      owner = await User.create({
        name: 'MysteryBite Demo Owner',
        email: 'demoowner@mysterybite.com',
        password: 'Demo123456',
        phone: '9999999999',
        role: 'restaurant_owner',
        isActive: true
      });

      console.log('Created demo restaurant owner.');
    } else {
      console.log('Demo restaurant owner already exists.');
    }

    // Create categories
    const pizzaCategory = await Category.create({
      name: 'Pizza',
      description: 'Fresh and delicious pizzas',
      icon: '🍕',
      isActive: true,
      order: 1
    });

    const burgerCategory = await Category.create({
      name: 'Burgers',
      description: 'Juicy burgers and sandwiches',
      icon: '🍔',
      isActive: true,
      order: 2
    });

    const indianCategory = await Category.create({
      name: 'Indian',
      description: 'Popular Indian dishes',
      icon: '🍛',
      isActive: true,
      order: 3
    });

    console.log('Created categories.');

    // Create restaurants
    const pizzaRestaurant = await Restaurant.create({
      name: 'Pizza Palace',
      owner: owner._id,
      description: 'Fresh pizzas made with quality ingredients.',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      coverImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      cuisine: ['italian', 'pizza'],
      categories: [pizzaCategory._id],
      address: {
        street: '123 Main Street',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        zipCode: '250001',
        coordinates: {
          lat: 28.9845,
          lng: 77.7064
        }
      },
      location: {
        type: 'Point',
        coordinates: [77.7064, 28.9845]
      },
      contact: {
        phone: '9999999991',
        email: 'pizza@mysterybite.com'
      },
      timings: {
        open: '10:00',
        close: '23:00',
        isOpen: true
      },
      rating: {
        average: 4.5,
        count: 120
      },
      priceRange: '$$',
      deliveryInfo: {
        time: '25-35 mins',
        fee: 40,
        minimumOrder: 199
      },
      features: ['delivery', 'takeout', 'dine-in', 'parking'],
      spinMode: {
        enabled: true,
        spinPrice: 15,
        availableItems: [],
        probabilities: []
      },
      mysteryMode: {
        enabled: true,
        availableCategories: ['Pizza']
      },
      isActive: true,
      isVerified: true
    });

    const burgerRestaurant = await Restaurant.create({
      name: 'Burger Hub',
      owner: owner._id,
      description: 'Tasty burgers, fries and refreshing drinks.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      cuisine: ['american', 'burger'],
      categories: [burgerCategory._id],
      address: {
        street: '45 Food Street',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        zipCode: '250002',
        coordinates: {
          lat: 28.9845,
          lng: 77.7064
        }
      },
      location: {
        type: 'Point',
        coordinates: [77.7100, 28.9850]
      },
      contact: {
        phone: '9999999992',
        email: 'burger@mysterybite.com'
      },
      timings: {
        open: '11:00',
        close: '23:30',
        isOpen: true
      },
      rating: {
        average: 4.3,
        count: 95
      },
      priceRange: '$',
      deliveryInfo: {
        time: '20-30 mins',
        fee: 30,
        minimumOrder: 149
      },
      features: ['delivery', 'takeout', 'dine-in', 'wifi'],
      spinMode: {
        enabled: true,
        spinPrice: 15,
        availableItems: [],
        probabilities: []
      },
      mysteryMode: {
        enabled: true,
        availableCategories: ['Burgers']
      },
      isActive: true,
      isVerified: true
    });

    const indianRestaurant = await Restaurant.create({
      name: 'Spice Kitchen',
      owner: owner._id,
      description: 'Delicious Indian food with authentic spices.',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
      coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
      cuisine: ['indian'],
      categories: [indianCategory._id],
      address: {
        street: '78 Central Road',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        zipCode: '250003',
        coordinates: {
          lat: 28.9900,
          lng: 77.7000
        }
      },
      location: {
        type: 'Point',
        coordinates: [77.7000, 28.9900]
      },
      contact: {
        phone: '9999999993',
        email: 'spice@mysterybite.com'
      },
      timings: {
        open: '11:00',
        close: '22:30',
        isOpen: true
      },
      rating: {
        average: 4.6,
        count: 150
      },
      priceRange: '$$',
      deliveryInfo: {
        time: '30-40 mins',
        fee: 40,
        minimumOrder: 199
      },
      features: ['delivery', 'takeout', 'dine-in', 'parking'],
      spinMode: {
        enabled: true,
        spinPrice: 15,
        availableItems: [],
        probabilities: []
      },
      mysteryMode: {
        enabled: true,
        availableCategories: ['Indian']
      },
      isActive: true,
      isVerified: true
    });

    console.log('Created 3 restaurants.');

    // Create foods
    const foods = await Food.create([
      {
        name: 'Margherita Pizza',
        restaurant: pizzaRestaurant._id,
        category: pizzaCategory._id,
        description: 'Classic pizza with tomato sauce, mozzarella and basil.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
        price: 249,
        originalPrice: 299,
        discount: 17,
        dietary: ['vegetarian'],
        spiceLevel: 'mild',
        ingredients: ['Tomato', 'Mozzarella', 'Basil'],
        nutritionInfo: {
          calories: 650,
          protein: '25g',
          carbs: '75g',
          fat: '24g'
        },
        servingSize: '1 medium pizza',
        preparationTime: '15-20 mins',
        isAvailable: true,
        isPopular: true,
        isRecommended: true,
        tags: ['pizza', 'vegetarian'],
        rating: {
          average: 4.6,
          count: 80
        },
        spinWeight: 2,
        mysteryCategory: 'Pizza'
      },
      {
        name: 'Paneer Tikka Pizza',
        restaurant: pizzaRestaurant._id,
        category: pizzaCategory._id,
        description: 'Indian-style pizza topped with spicy paneer tikka.',
        image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498',
        price: 329,
        originalPrice: 379,
        discount: 13,
        dietary: ['vegetarian'],
        spiceLevel: 'medium',
        ingredients: ['Paneer', 'Mozzarella', 'Onion', 'Capsicum'],
        nutritionInfo: {
          calories: 720,
          protein: '30g',
          carbs: '78g',
          fat: '29g'
        },
        servingSize: '1 medium pizza',
        preparationTime: '20-25 mins',
        isAvailable: true,
        isPopular: true,
        isRecommended: true,
        tags: ['pizza', 'paneer', 'indian'],
        rating: {
          average: 4.7,
          count: 65
        },
        spinWeight: 1,
        mysteryCategory: 'Pizza'
      },
      {
        name: 'Classic Chicken Burger',
        restaurant: burgerRestaurant._id,
        category: burgerCategory._id,
        description: 'Crispy chicken burger with lettuce and special sauce.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        price: 199,
        originalPrice: 229,
        discount: 13,
        dietary: ['non-vegetarian'],
        spiceLevel: 'medium',
        ingredients: ['Chicken', 'Lettuce', 'Cheese', 'Sauce'],
        nutritionInfo: {
          calories: 590,
          protein: '32g',
          carbs: '52g',
          fat: '27g'
        },
        servingSize: '1 burger',
        preparationTime: '15-20 mins',
        isAvailable: true,
        isPopular: true,
        tags: ['burger', 'chicken'],
        rating: {
          average: 4.4,
          count: 70
        },
        spinWeight: 2,
        mysteryCategory: 'Burgers'
      },
      {
        name: 'Veg Cheese Burger',
        restaurant: burgerRestaurant._id,
        category: burgerCategory._id,
        description: 'Crispy vegetable patty with cheese and fresh vegetables.',
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
        price: 159,
        originalPrice: 189,
        discount: 16,
        dietary: ['vegetarian'],
        spiceLevel: 'mild',
        ingredients: ['Vegetable Patty', 'Cheese', 'Lettuce', 'Tomato'],
        nutritionInfo: {
          calories: 480,
          protein: '18g',
          carbs: '55g',
          fat: '20g'
        },
        servingSize: '1 burger',
        preparationTime: '10-15 mins',
        isAvailable: true,
        isPopular: true,
        tags: ['burger', 'vegetarian'],
        rating: {
          average: 4.2,
          count: 55
        },
        spinWeight: 2,
        mysteryCategory: 'Burgers'
      },
      {
        name: 'Chicken Biryani',
        restaurant: indianRestaurant._id,
        category: indianCategory._id,
        description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices.',
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c',
        price: 299,
        originalPrice: 349,
        discount: 14,
        dietary: ['non-vegetarian'],
        spiceLevel: 'spicy',
        ingredients: ['Chicken', 'Basmati Rice', 'Onion', 'Spices'],
        nutritionInfo: {
          calories: 720,
          protein: '38g',
          carbs: '85g',
          fat: '24g'
        },
        servingSize: '1 serving',
        preparationTime: '25-30 mins',
        isAvailable: true,
        isPopular: true,
        isRecommended: true,
        tags: ['biryani', 'chicken', 'indian'],
        rating: {
          average: 4.8,
          count: 110
        },
        spinWeight: 2,
        mysteryCategory: 'Indian'
      },
      {
        name: 'Paneer Butter Masala',
        restaurant: indianRestaurant._id,
        category: indianCategory._id,
        description: 'Soft paneer cooked in a creamy tomato and butter gravy.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
        price: 249,
        originalPrice: 289,
        discount: 14,
        dietary: ['vegetarian'],
        spiceLevel: 'medium',
        ingredients: ['Paneer', 'Tomato', 'Butter', 'Cream', 'Spices'],
        nutritionInfo: {
          calories: 560,
          protein: '22g',
          carbs: '28g',
          fat: '36g'
        },
        servingSize: '1 serving',
        preparationTime: '20-25 mins',
        isAvailable: true,
        isPopular: true,
        tags: ['paneer', 'indian', 'vegetarian'],
        rating: {
          average: 4.7,
          count: 90
        },
        spinWeight: 2,
        mysteryCategory: 'Indian'
      }
    ]);

    console.log(`Created ${foods.length} foods.`);

    // Configure Spin Mode using the created food IDs
    const pizzaFoods = foods.filter(
      food => food.restaurant.toString() === pizzaRestaurant._id.toString()
    );

    const burgerFoods = foods.filter(
      food => food.restaurant.toString() === burgerRestaurant._id.toString()
    );

    const indianFoods = foods.filter(
      food => food.restaurant.toString() === indianRestaurant._id.toString()
    );

    await Restaurant.findByIdAndUpdate(pizzaRestaurant._id, {
      'spinMode.availableItems': pizzaFoods.map(food => food._id),
      'spinMode.probabilities': pizzaFoods.map(food => ({
        foodId: food._id,
        probability: 50
      }))
    });

    await Restaurant.findByIdAndUpdate(burgerRestaurant._id, {
      'spinMode.availableItems': burgerFoods.map(food => food._id),
      'spinMode.probabilities': burgerFoods.map(food => ({
        foodId: food._id,
        probability: 50
      }))
    });

    await Restaurant.findByIdAndUpdate(indianRestaurant._id, {
      'spinMode.availableItems': indianFoods.map(food => food._id),
      'spinMode.probabilities': indianFoods.map(food => ({
        foodId: food._id,
        probability: 50
      }))
    });

    console.log('Spin Mode configured.');

    console.log('\n====================================');
    console.log('DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('====================================');
    console.log('Restaurants: 3');
    console.log('Foods: 6');
    console.log('Categories: 3');
    console.log('Demo owner: demoowner@mysterybite.com');
    console.log('Demo password: Demo123456');
    console.log('====================================\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\nSEED ERROR:');
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
