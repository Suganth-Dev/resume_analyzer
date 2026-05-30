import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Zap, FileSearch, BrainCircuit, BarChart3, ShieldCheck, ExternalLink } from 'lucide-react-native';

const FEATURES = [
  {
    icon: FileSearch,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    title: 'ATS Score Analysis',
    description: 'Upload your PDF resume and receive an instant ATS compatibility score out of 100 against your target job role.',
  },
  {
    icon: BrainCircuit,
    color: '#0ea5e9',
    bg: 'rgba(14, 165, 233, 0.12)',
    title: 'Skill Gap Detection',
    description: 'Automatically identify missing skills and technologies that recruiters look for in your chosen role.',
  },
  {
    icon: BarChart3,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    title: 'Optimization Recommendations',
    description: 'Get actionable tips on how to improve your resume to pass automated screening systems.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    title: 'Re-Analyze for Any Role',
    description: 'Re-align any saved resume audit against a different job role without re-uploading your file.',
  },
  {
    icon: ShieldCheck,
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    title: 'Secure & Private',
    description: 'Your resume data and credentials are stored securely with JWT authentication and encrypted tokens.',
  },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Zap size={13} color="#c084fc" />
          <Text style={styles.badgeText}>Resume Intelligence Tool</Text>
        </View>
        <Text style={styles.title}>About Sugan{'\n'}<Text style={styles.titleHighlight}>Resume Analyzer</Text></Text>
        <Text style={styles.subtitle}>
          A specialized ATS resume analyzer built for developers targeting MERN stack and modern tech positions.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionLabel}>Core Features</Text>
        {FEATURES.map(({ icon: Icon, color, bg, title, description }) => (
          <View key={title} style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
              <Icon size={22} color={color} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Supported Roles */}
      <View style={styles.rolesSection}>
        <Text style={styles.sectionLabel}>Supported Job Roles</Text>
        <View style={styles.rolesGrid}>
          {['MERN Stack Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Python Developer'].map(role => (
            <View key={role} style={styles.roleChip}>
              <Text style={styles.roleChipText}>{role}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Version info */}
      <View style={styles.versionCard}>
        <Text style={styles.versionLabel}>Version</Text>
        <Text style={styles.versionValue}>1.0.0</Text>
      </View>
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
    gap: 28,
    paddingBottom: 48,
  },
  header: {
    gap: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  badgeText: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: '#c084fc',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  featuresSection: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  featureDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  rolesSection: {
    gap: 12,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  roleChipText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '600',
  },
  versionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  versionLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  versionValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
