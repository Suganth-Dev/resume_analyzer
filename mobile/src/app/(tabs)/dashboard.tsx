import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useResumeStore } from '../../store/resumeStore';
import { useAuthStore } from '../../store/authStore';
import { FileText, Award, Layers, Target, ChevronRight, Upload } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    stats, 
    resumes, 
    loading, 
    fetchDashboardStats, 
    fetchResumes 
  } = useResumeStore();

  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchResumes('', '', 1, 5) // Fetch first 5 analyses
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentResumes = resumes.slice(0, 5);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c084fc" />
      }
    >
      {/* Welcome Banner */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, {user?.name || 'Candidate'}</Text>
        <Text style={styles.subtext}>Monitor your resume ATS optimizations here</Text>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.grid}>
        {/* Total Resumes */}
        <View style={styles.kpiCard}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
            <FileText size={20} color="#a855f7" />
          </View>
          <Text style={styles.kpiLabel}>Total Resumes</Text>
          <Text style={styles.kpiValue}>{stats.summary.totalResumes}</Text>
        </View>

        {/* Avg ATS Score */}
        <View style={styles.kpiCard}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
            <Award size={20} color="#0ea5e9" />
          </View>
          <Text style={styles.kpiLabel}>Average Score</Text>
          <Text style={styles.kpiValue}>{stats.summary.averageScore}/100</Text>
        </View>

        {/* Best Score */}
        <View style={styles.kpiCard}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Target size={20} color="#10b981" />
          </View>
          <Text style={styles.kpiLabel}>Best Score</Text>
          <Text style={styles.kpiValue}>{stats.summary.bestScore}/100</Text>
        </View>

        {/* Avg Skill Match */}
        <View style={styles.kpiCard}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Layers size={20} color="#f59e0b" />
          </View>
          <Text style={styles.kpiLabel}>Skill Match Avg</Text>
          <Text style={styles.kpiValue}>{stats.summary.averageSkillMatch}%</Text>
        </View>
      </View>

      {/* Upload Call to Action */}
      <TouchableOpacity 
        style={styles.ctaCard}
        onPress={() => router.push('/(tabs)/analyzer')}
      >
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>Ready to Analyze a New Resume?</Text>
          <Text style={styles.ctaSubtitle}>Scan your PDF resume against developer roles instantly.</Text>
        </View>
        <View style={styles.ctaButton}>
          <Upload size={18} color="#ffffff" />
          <Text style={styles.ctaButtonText}>Scan Now</Text>
        </View>
      </TouchableOpacity>

      {/* Recent Scans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator color="#c084fc" style={{ marginVertical: 20 }} />
        ) : recentResumes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No resumes analyzed yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {recentResumes.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.listItem}
                onPress={() => router.push(`/analysis/${item._id}`)}
              >
                <View style={styles.listItemDetails}>
                  <Text style={styles.listItemTitle}>{item.SelectedJobRole}</Text>
                  <Text style={styles.listItemDate}>
                    {new Date(item.CreatedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.listItemRight}>
                  <View style={[
                    styles.scoreBadge,
                    { backgroundColor: item.ResumeScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.15)' }
                  ]}>
                    <Text style={[
                      styles.scoreBadgeText,
                      { color: item.ResumeScore >= 80 ? '#10b981' : '#c084fc' }
                    ]}>
                      {item.ResumeScore}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#475569" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ctaCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  ctaContent: {
    gap: 6,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  seeAllText: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  listItemDetails: {
    gap: 4,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listItemDate: {
    fontSize: 12,
    color: '#64748b',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
