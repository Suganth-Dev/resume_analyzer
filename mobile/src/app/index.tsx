import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <SafeAreaView style={styles.content}>
        <View style={styles.heroContainer}>
          {/* Logo badge */}
          <View style={styles.badge}>
            <Zap size={14} color="#c084fc" />
            <Text style={styles.badgeText}>ATS Optimization Tool</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Sugan{'\n'}
            <Text style={styles.titleHighlight}>Resume Analyzer</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Upload your resume PDF, evaluate it against target job roles, calculate ATS scores, and map skill gaps instantly.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ShieldCheck size={16} color="#10b981" />
          <Text style={styles.footerText}>Secure Data Encryption</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  glowSpot1: {
    position: 'absolute',
    top: '-15%',
    left: '-15%',
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: (width * 1.0) / 2,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    filter: 'blur(80px)',
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    filter: 'blur(80px)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 24,
    gap: 6,
  },
  badgeText: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: '#c084fc',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.4)',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
});
