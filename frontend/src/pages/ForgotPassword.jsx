import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { BrainCircuit, Mail, Loader2, ArrowLeft, Send } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email address').required('Email is required')
});

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      toast.success('Password reset email sent! Please check your inbox.');
      navigate('/login');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Decorative spotlights */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-3">
            <BrainCircuit className="w-10 h-10 text-brand-400" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Resume<span className="text-gradient">AI</span>
            </span>
          </Link>
          <p className="text-sm text-dark-400">Restore access to your optimization account</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-dark-800/80 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Forgot Password</h2>
          <p className="text-xs text-dark-400 text-center mb-6 leading-relaxed">
            Enter your registered email address below, and we'll send you instructions to securely reset your password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-brand font-semibold text-white text-sm hover:brightness-110 disabled:brightness-75 transition-all shadow-lg shadow-brand-500/20 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  Send Reset Link
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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

export default ForgotPassword;
