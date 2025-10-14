# e-Gram Panchayat - Setup Guide

This guide will help you set up and run the e-Gram Panchayat MERN stack application.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB Atlas account (for cloud database)
- Git
- A code editor (VS Code recommended)

## Project Structure

```
e-gram-panchayat/
├── frontend/          # React.js frontend application
├── backend/           # Node.js backend API
├── package.json       # Root package.json for scripts
├── README.md         # Project documentation
└── SETUP.md          # This setup guide
```

## Quick Start

### 1. Install Dependencies

Run the following command in the project root to install dependencies for all parts:

```bash
npm run install-all
```

### 2. Environment Setup

#### Backend Environment Variables

1. Copy the example environment file:
```bash
cp backend/env.example backend/.env
```

2. Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-gram-panchayat
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters_long
JWT_EXPIRE=7d
OTP_SECRET=your_otp_secret_key_here

# Email Configuration (Optional - for OTP via email)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### 3. Database Setup

#### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in `backend/.env`

### 4. Start the Application

#### Development Mode

Start both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5000
- Frontend React app on http://localhost:3000

#### Individual Services

Start backend only:
```bash
npm run server
```

Start frontend only:
```bash
npm run client
```

## Features Implemented

### Backend Features
- ✅ User authentication with JWT and OTP
- ✅ User registration and verification
- ✅ Application submission and management
- ✅ Grievance tracking system
- ✅ Government schemes database
- ✅ Announcements system
- ✅ Admin dashboard APIs
- ✅ File upload support
- ✅ Rate limiting and security middleware
- ✅ Comprehensive API documentation

### Frontend Features
- ✅ Responsive design with Tailwind CSS
- ✅ Dark/Light mode toggle
- ✅ Multi-language support (English/Hindi)
- ✅ User authentication flow
- ✅ Protected routes
- ✅ Modern UI components
- ✅ State management with Zustand
- ✅ API integration with React Query
- ✅ Form validation with React Hook Form
- ✅ Toast notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Submit new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Grievances
- `GET /api/grievances` - Get user grievances
- `POST /api/grievances` - Submit new grievance
- `GET /api/grievances/:id` - Get grievance details
- `PUT /api/grievances/:id` - Update grievance

### Schemes
- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme details
- `GET /api/schemes/featured` - Get featured schemes
- `POST /api/schemes/:id/check-eligibility` - Check eligibility

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/applications` - Get all applications
- `PUT /api/admin/applications/:id/status` - Update application status
- `GET /api/admin/grievances` - Get all grievances
- `PUT /api/admin/grievances/:id/status` - Update grievance status

## Testing the Application

### 1. User Registration and Login

1. Go to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Verify your account with OTP (check console for OTP in development)
4. Login with your credentials

### 2. Admin Access

To create an admin user, you can either:
1. Manually update the user role in MongoDB Atlas
2. Use the admin API endpoints
3. Create a seed script (recommended for development)

### 3. Sample Data

The application includes sample data for schemes and announcements. You can add more through the admin interface or directly in the database.

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to your hosting service
3. Set environment variables in your hosting service:
   - `REACT_APP_API_URL` - Your backend API URL

### Backend Deployment (Heroku/Railway)

1. Create a new project on your hosting service
2. Connect your GitHub repository
3. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret
   - All other environment variables from the example

### Database Deployment

1. Use MongoDB Atlas for production
2. Ensure proper security settings
3. Set up database backups
4. Configure connection limits

## Security Considerations

### Production Security

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, random secrets
3. **CORS**: Configure CORS properly for production domains
4. **Rate Limiting**: Adjust rate limits for production
5. **HTTPS**: Always use HTTPS in production
6. **Database**: Use strong passwords and IP whitelisting

### Security Headers

The backend includes security middleware:
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Verify IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

2. **CORS Errors**
   - Update CORS configuration in `backend/server.js`
   - Check frontend API URL configuration

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set

4. **Authentication Issues**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser storage and try again

### Development Tips

1. **API Testing**: Use Postman or similar tools to test API endpoints
2. **Database Inspection**: Use MongoDB Compass to inspect your database
3. **Logs**: Check console logs for detailed error messages
4. **Network**: Use browser dev tools to monitor network requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository

## License

This project is licensed under the MIT License.

---

**Note**: This is a development setup. For production deployment, additional security measures and optimizations should be implemented.
