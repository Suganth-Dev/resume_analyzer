import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  Save, 
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Enter a valid email address').required('Email is required')
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'New password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
});

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form Hook
  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors }
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Password Form Hook
  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPassForm,
    formState: { errors: passErrors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onUpdateInfo = async (data) => {
    setInfoLoading(true);
    const result = await updateProfile({ name: data.name, email: data.email });
    setInfoLoading(false);
    if (result.success) {
      toast.success('Profile details updated successfully.');
    } else {
      toast.error(result.message);
    }
  };

  const onUpdatePassword = async (data) => {
    setPassLoading(true);
    const result = await updateProfile({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    setPassLoading(false);
    if (result.success) {
      toast.success('Password updated successfully.');
      resetPassForm();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile & Settings</h1>
        <p className="text-sm text-dark-400">Manage your profile credentials and security preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form 1: General Info Card */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" />
              General Information
            </h2>

            <form onSubmit={handleInfoSubmit(onUpdateInfo)} className="space-y-5">
              {/* Name input */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
                    {...registerInfo('name')}
                  />
                </div>
                {infoErrors.name && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">{infoErrors.name.message}</p>
                )}
              </div>

              {/* Email input */}
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
                    {...registerInfo('email')}
                  />
                </div>
                {infoErrors.email && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">{infoErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={infoLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:brightness-75 font-semibold text-sm text-white transition-all shadow-md mt-6 cursor-pointer"
              >
                {infoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Information
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Form 2: Password Update Card */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-800/80 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-400" />
            Change Password
          </h2>

          <form onSubmit={handlePassSubmit(onUpdatePassword)} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg glass-input text-sm text-white"
                  {...registerPass('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passErrors.currentPassword && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{passErrors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg glass-input text-sm text-white"
                  {...registerPass('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passErrors.newPassword && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{passErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg glass-input text-sm text-white"
                  {...registerPass('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">{passErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:brightness-75 font-semibold text-sm text-white transition-all shadow-md cursor-pointer"
            >
              {passLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
