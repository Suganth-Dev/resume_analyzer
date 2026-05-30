import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Lock, Eye, EyeOff, LogOut, Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, updateProfile, logout, loading } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show password flags
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateInfo = async () => {
    if (!name || !email) {
      Alert.alert('Validation Error', 'Full Name and Email are required.');
      return;
    }
    setInfoLoading(true);
    const result = await updateProfile({ name: name.trim(), email: email.trim() });
    setInfoLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully.');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setPassLoading(true);
    const result = await updateProfile({
      name: user?.name || name,
      email: user?.email || email,
      currentPassword,
      newPassword,
    });
    setPassLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* General info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>General Information</Text>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@company.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdateInfo}
            disabled={infoLoading}
          >
            {infoLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <View style={styles.saveBtnWrapper}>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveBtnText}>Save Information</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Change Password Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Password</Text>
        
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                secureTextEntry={!showCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} color="#64748b" />
                ) : (
                  <Eye size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                secureTextEntry={!showNewPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={18} color="#64748b" />
                ) : (
                  <Eye size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 48 }]}
                secureTextEntry={!showConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#64748b" />
                ) : (
                  <Eye size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleChangePassword}
            disabled={passLoading}
          >
            {passLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <LogOut size={18} color="#f87171" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    height: 52,
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
