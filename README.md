# MysteryBite - Gamified Food Delivery Application

A full-stack food delivery application with three unique ordering modes: Safe Mode (traditional), Spin Mode (spin wheel game), and Mystery Food Challenge Mode (guessing game with rewards).

## 🚀 Features

### Three Ordering Modes
1. **Safe Mode** - Traditional food ordering similar to Zomato/Swiggy
   - Browse restaurants and foods
   - Add to cart and checkout
   - Real-time order tracking
   - Reviews and ratings

2. **Spin Mode** - Gamified spin wheel experience
   - Pay a fixed amount to spin the wheel
   - Win random food items at discounted prices
   - Animated wheel with realistic physics
   - Celebration effects on winning

3. **Mystery Food Challenge** - Exciting guessing game
   - Order a food, receive a different mystery food
   - Guess what you received to win rewards
   - Leaderboard and streak tracking
   - Discount coupons for correct guesses

### Additional Features
- **User Authentication** - JWT-based auth with role-based access (Customer, Restaurant Owner, Admin)
- **Real-time Order Tracking** - Socket.io integration for live updates
- **Payment Integration** - Razorpay payment gateway
- **Loyalty Program** - Earn points on orders, redeem for discounts
- **Referral System** - Invite friends and earn rewards
- **Wishlist** - Save favorite foods for later
- **AI Recommendations** - Personalized food suggestions
- **Mood-based Discovery** - Find food based on your mood
- **Admin Dashboard** - Complete admin panel for managing users, restaurants, orders
- **Restaurant Dashboard** - Restaurant owner panel for menu and order management
- **Modern UI** - Glassmorphism design with Framer Motion animations
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Zustand** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway
- **Multer** - File uploads
- **Cloudinary** - Image storage

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd interview.ai
```

### 2. Install dependencies
```bash
npm run install:all
```

This will install dependencies for both frontend and backend.

### 3. Set up environment variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mysterybite
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Credentials (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
# or
mongod
```

### 5. Run the application

#### Development mode (both frontend and backend):
```bash
npm run dev
```

#### Run separately:
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
interview.ai/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant (Restaurant Owner)
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `GET /api/restaurants/:id/foods` - Get restaurant foods

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get single food
- `POST /api/foods` - Create food (Restaurant Owner)
- `PUT /api/foods/:id` - Update food
- `DELETE /api/foods/:id` - Delete food
- `GET /api/foods/popular` - Get popular foods
- `GET /api/foods/recommended` - Get recommended foods

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders (filtered by role)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/rate` - Rate order

### Spin Mode
- `GET /api/spin/restaurant/:restaurantId` - Get spin details
- `POST /api/spin` - Spin the wheel
- `GET /api/spin/history` - Get spin history

### Mystery Mode
- `GET /api/mystery/restaurant/:restaurantId` - Get mystery details
- `POST /api/mystery/order` - Create mystery order
- `POST /api/mystery/guess` - Submit guess
- `GET /api/mystery/history` - Get mystery history
- `GET /api/mystery/leaderboard` - Get leaderboard

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/refund/:orderId` - Process refund

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/restaurants` - Get all restaurants
- `PUT /api/admin/restaurants/:id/verify` - Verify restaurant
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/coupons` - Get all coupons

### Rewards
- `GET /api/rewards` - Get user rewards
- `GET /api/rewards/points` - Get loyalty points
- `POST /api/rewards/redeem` - Redeem points
- `POST /api/rewards/referral` - Get referral link

## 👥 User Roles

### Customer
- Browse restaurants and foods
- Place orders (Safe, Spin, Mystery modes)
- Track orders
- Manage wishlist
- Earn and redeem loyalty points
- Refer friends

### Restaurant Owner
- Register restaurant
- Manage food menu
- Receive and manage orders
- View analytics and revenue
- Configure Spin and Mystery modes

### Admin
- Manage users and restaurants
- View platform analytics
- Manage coupons and promotions
- Configure platform settings

## 🎨 UI Features

- **Glassmorphism Design** - Modern glass-like UI elements
- **Smooth Animations** - Framer Motion powered transitions
- **Dark/Light Mode** - Theme toggle
- **Responsive Layout** - Mobile-first design
- **Loading States** - Skeleton loaders and spinners
- **Toast Notifications** - User feedback messages
- **Confetti Effects** - Celebration animations

## 🔒 Security Features

- JWT Authentication
- Password hashing with Bcrypt
- Role-based access control
- Input validation
- Rate limiting
- XSS protection
- CSRF protection
- Secure cookies

## 🚀 Deployment

### Build for production
```bash
# Frontend
cd frontend
npm run build

# Backend is production-ready by default
```

### Environment Variables for Production
Make sure to set all required environment variables in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Valid Razorpay credentials
- MongoDB connection string with authentication

### Using Docker (Optional)
Create a `Dockerfile` for both frontend and backend for containerized deployment.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@mysterybite.com

---

Built with ❤️ using React, Node.js, and MongoDB
