# e-Gram Panchayat - Digital Village Council Management System

A comprehensive MERN stack application for digital governance and citizen services in rural India.

## Features

- **User Authentication**: Secure login/signup with OTP verification
- **Digital Services**: Property tax, certificates, financial aid applications
- **Grievance Management**: Submit and track complaints
- **Scheme Information**: Browse government schemes and benefits
- **Admin Dashboard**: Manage applications, grievances, and announcements
- **Voice Assistant**: AI-powered voice interface for accessibility
- **Announcements**: Latest updates and important notifications
- **Multi-language Support**: English and Hindi interface

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Material Icons
- **Backend**: Node.js, Express.js, MongoDB Atlas
- **Authentication**: JWT with OTP verification
- **Security**: bcrypt, helmet, cors, rate limiting

## Project Structure

```
e-gram-panchayat/
├── frontend/          # React.js frontend application
├── backend/           # Node.js backend API
├── package.json       # Root package.json for scripts
└── README.md         # Project documentation
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd e-gram-panchayat
```

2. Install dependencies for all parts
```bash
npm run install-all
```

3. Set up environment variables
```bash
# Backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB Atlas connection string and JWT secret
```

4. Start the development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
OTP_SECRET=your_otp_secret_key
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Submit new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application

### Grievances
- `GET /api/grievances` - Get user grievances
- `POST /api/grievances` - Submit new grievance
- `GET /api/grievances/:id` - Get grievance details

### Schemes
- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme details
- `GET /api/schemes/search` - Search schemes

### Admin
- `GET /api/admin/applications` - Get all applications
- `PUT /api/admin/applications/:id/status` - Update application status
- `GET /api/admin/grievances` - Get all grievances
- `PUT /api/admin/grievances/:id/status` - Update grievance status

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Deploy with environment variables configured
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and queries, please contact the development team.
