import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
// NOTE: useAuthStore and LoadingSpinner are defined internally for compilation
import { Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// --- MOCK COMPONENTS AND STORE FOR COMPILATION ---

const PRIMARY_COLOR_CLASS = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-blue-600 dark:text-blue-500';

const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
            <Loader className={`animate-spin ${sizeClasses[size]} text-white`} />
        </div>
    );
};



   
// --- END MOCK COMPONENTS AND STORE ---


const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  // Renamed 'register' function from hook to 'formRegister' to avoid conflict with authStore.register
  const { register: registerAuth, isLoading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    getValues // Added getValues to retrieve password for custom validation
  } = useForm();

  const onRegisterSubmit = async (data) => {
    // Send all form data including confirmPassword for backend validation
    const result = await registerAuth(data);
    if (result.success) {
      toast.success(result.message || 'Registration successful! Welcome!');
      // User is automatically logged in, redirect to dashboard
      if (result.user.role === 'admin' || result.user.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 font-inter">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-10 h-10 ${PRIMARY_COLOR_CLASS.split(' ')[0]} rounded-xl flex items-center justify-center shadow-md`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Simple village/house icon */}
                <path d="M12 3L2 9v12h20V9L12 3zm-1 15H9v-6h2v6zm4 0h-2v-6h2v6z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              e-Gram Panchayat
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Create Citizen Account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign up to access government services
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                {...formRegister('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                type="text"
                autoComplete="name"
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                {...formRegister('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                {...formRegister('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit phone number starting with 6-9'
                  }
                })}
                type="tel"
                autoComplete="tel"
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...formRegister('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                {...formRegister('confirmPassword', {
                  required: 'Confirmation is required',
                  validate: value =>
                    value === getValues('password') || 'Passwords must match'
                })}
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address (Village, District, State, Pincode)
              </label>
              <textarea
                {...formRegister('address', {
                  required: 'Address is required',
                  minLength: {
                    value: 10,
                    message: 'Address must be at least 10 characters'
                  }
                })}
                rows={3}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150`}
                placeholder="E.g., V: Mukandpura, D: Jaipur, S: Rajasthan, P: 303803"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white ${PRIMARY_COLOR_CLASS.split(' ')[0]} ${PRIMARY_COLOR_CLASS.split(' ')[1]} focus:outline-none focus:ring-2 focus:ring-offset-2 ${PRIMARY_COLOR_CLASS.split(' ')[2]} disabled:opacity-50 disabled:cursor-not-allowed transition duration-300`}
            >
              {isLoading ? <LoadingSpinner size="md" /> : 'Create Account'}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className={`text-blue-600 dark:text-blue-500 hover:text-blue-700 font-medium transition duration-150`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <Link to="/terms" className={`text-blue-600 dark:text-blue-500 hover:text-blue-700 transition duration-150`}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className={`text-blue-600 dark:text-blue-500 hover:text-blue-700 transition duration-150`}>
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
