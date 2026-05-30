import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { toast } from 'react-toastify';
import { BrainCircuit, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const Login = () => {
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const { login, loading: userLoading } = useAuthStore();
  const { adminLogin, loading: adminLoading } = useAdminStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const loading = loginType === 'user' ? userLoading : adminLoading;

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    if (loginType === 'user') {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Welcome back! Login successful.');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await adminLogin(data.email, data.password);
      if (result.success) {
        toast.success('Welcome to the admin panel!');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Radial Glowing Spotlights */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" />

      {/* Main card panel */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-3">
            <BrainCircuit className="w-10 h-10 text-brand-400" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Sugan Resume <span className="text-gradient">Analyzer</span>
            </span>
          </Link>
          <p className="text-sm text-dark-400">Optimize your career path using artificial intelligence</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl">
          {/* User / Admin Toggle Tabs */}
          <div className="flex p-1 bg-dark-900/60 border border-dark-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('user');
                reset();
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                loginType === 'user'
                  ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/10'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                reset();
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                loginType === 'admin'
                  ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/10'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Administrator
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {loginType === 'user' ? 'Candidate Sign In' : 'Admin Sign In'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder={loginType === 'user' ? 'name@company.com' : 'admin@gmail.com'}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm ${
                    errors.email ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/10' : ''
                  }`}
                  {...registerField('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider">Password</label>
                {loginType === 'user' && (
                  <Link to="/forgot-password" className="text-xs font-semibold text-brand-400 hover:text-brand-350 transition-colors">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg glass-input text-sm ${
                    errors.password ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/10' : ''
                  }`}
                  {...registerField('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-brand font-semibold text-white text-sm hover:brightness-110 disabled:brightness-75 transition-all shadow-lg shadow-brand-500/20 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Redirection link */}
          {loginType === 'user' && (
            <p className="text-sm text-dark-400 text-center mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-350 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

