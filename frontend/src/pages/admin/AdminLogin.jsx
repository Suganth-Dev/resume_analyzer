import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-toastify';
import { ShieldAlert, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required')
});

const AdminLogin = () => {
  const { adminLogin, loading } = useAdminStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    const result = await adminLogin(data.email, data.password);
    if (result.success) {
      toast.success('Admin login successful! Welcome to the Admin Panel.');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Decorative spotlights */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" style={{ filter: 'hue-rotate(60deg)' }} />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" style={{ filter: 'hue-rotate(60deg)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Admin<span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)' }}>Panel</span>
            </span>
          </div>
          <p className="text-sm text-dark-400">Administrative Portal</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Admin Access Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm ${
                    errors.email ? 'border-red-500/80 focus:border-red-500' : ''
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg glass-input text-sm ${
                    errors.password ? 'border-red-500/80 focus:border-red-500' : ''
                  }`}
                  {...register('password')}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 font-semibold text-white text-sm hover:brightness-110 disabled:brightness-75 transition-all shadow-lg shadow-rose-500/20 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs text-dark-400 hover:text-white transition-colors">
              Are you a user? Go to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
