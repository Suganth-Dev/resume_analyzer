import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { BrainCircuit, Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const schema = yup.object().shape({
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const ResetPassword = () => {
  const { resetPassword, loading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing from URL.');
      return;
    }

    const result = await resetPassword(token, data.password);
    if (result.success) {
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Spotlights */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-3">
            <BrainCircuit className="w-10 h-10 text-brand-400" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Sugan Resume <span className="text-gradient">Analyzer</span>
            </span>
          </Link>
          <p className="text-sm text-dark-400">Restore access to your optimization account</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
          <p className="text-xs text-dark-400 text-center mb-6">
            Enter your new secure password below to unlock your account.
          </p>

          {!token ? (
            <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-xs text-red-400 text-center space-y-4">
              <p>The password reset token is missing. Please request a new password reset email.</p>
              <Link to="/forgot-password" className="inline-block text-xs font-semibold text-brand-400 underline">
                Request Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">New Password</label>
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg glass-input text-sm ${
                      errors.confirmPassword ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/10' : ''
                    }`}
                    {...registerField('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-brand font-semibold text-white text-sm hover:brightness-110 disabled:brightness-75 transition-all shadow-lg shadow-brand-500/20 mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* Go Back button */}
          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-350 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
