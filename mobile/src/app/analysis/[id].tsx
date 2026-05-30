import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useResumeStore } from '../../store/resumeStore';
import { JOB_ROLES } from '../../constants/jobRoles';
import { Award, Layers, HelpCircle, Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react-native';

export default function AnalysisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    currentAnalysis, 
    loading, 
    fetchResumeById, 
    reanalyzeResume, 
    deleteResume 
  } = useResumeStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResumeById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentAnalysis) {
      setSelectedRole(currentAnalysis.SelectedJobRole);
    }
  }, [currentAnalysis]);

  if (loading && !currentAnalysis) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c084fc" />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </View>
    );
  }

  if (!currentAnalysis) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Report not found or failed to load.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReanalyze = async () => {
    if (!id) return;
    setReanalyzing(true);
    const result = await reanalyzeResume(id, selectedRole);
    setReanalyzing(false);
    setShowRolePicker(false);

    if (result.success) {
      Alert.alert('Success', 'Resume re-analyzed successfully.');
    } else {
      Alert.alert('Error', result.message || 'Failed to re-analyze resume.');
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete this resume audit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteResume(id);
            if (result.success) {
              router.replace('/(tabs)/history');
            } else {
              Alert.alert('Error', result.message || 'Failed to delete resume.');
            }
          }
        }
      ]
    );
  };

  const scoreColor = currentAnalysis.ResumeScore >= 80 ? '#10b981' : '#8b5cf6';
  const matchColor = currentAnalysis.SkillMatchPercentage >= 75 ? '#10b981' : '#0ea5e9';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.roleTitle}>{currentAnalysis.SelectedJobRole}</Text>
        <Text style={styles.dateSub}>
          Scanned on {new Date(currentAnalysis.CreatedAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Ring Dials Overview */}
      <View style={styles.statsRow}>
        {/* ATS Score ring */}
        <View style={styles.statCard}>
          <Text style={styles.statCardTitle}>ATS Score</Text>
          <View style={[styles.statRing, { borderColor: scoreColor }]}>
            <Text style={[styles.statRingText, { color: scoreColor }]}>
              {currentAnalysis.ResumeScore}
            </Text>
            <Text style={styles.statRingSub}>/ 100</Text>
          </View>
          <Text style={styles.statDesc}>
            {currentAnalysis.ResumeScore >= 80 ? 'ATS Optimized' : 'Needs Optimization'}
          </Text>
        </View>

        {/* Skill Match percentage ring */}
        <View style={styles.statCard}>
          <Text style={styles.statCardTitle}>Skill Match</Text>
          <View style={[styles.statRing, { borderColor: matchColor }]}>
            <Text style={[styles.statRingText, { color: matchColor }]}>
              {currentAnalysis.SkillMatchPercentage}
            </Text>
            <Text style={styles.statRingSub}>%</Text>
          </View>
          <Text style={styles.statDesc}>
            Competency alignment rating
          </Text>
        </View>
      </View>

      {/* Actions (Re-analyze, Delete) */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => setShowRolePicker(!showRolePicker)}
          disabled={reanalyzing}
        >
          <RefreshCw size={16} color="#ffffff" style={reanalyzing && styles.spinIcon} />
          <Text style={styles.actionBtnText}>Re-align Role</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Trash2 size={16} color="#f87171" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Role Picker Modal Overlay */}
      {showRolePicker && (
        <View style={styles.rolePickerCard}>
          <Text style={styles.pickerTitle}>Select Target Job Role</Text>
          <View style={styles.pickerGrid}>
            {JOB_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.pickerItem, role === selectedRole && styles.pickerItemActive]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[styles.pickerItemText, role === selectedRole && styles.pickerItemTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.pickerSubmitBtn}
            onPress={handleReanalyze}
            disabled={reanalyzing}
          >
            {reanalyzing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.pickerSubmitBtnText}>Apply Realignment</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Missing Skills (Skill Gaps) */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <AlertCircle size={18} color="#f87171" />
          <Text style={styles.sectionTitle}>Identify Skill Gaps</Text>
        </View>
        <View style={styles.sectionBody}>
          {currentAnalysis.MissingSkills.length === 0 ? (
            <View style={styles.successBlock}>
              <Check size={18} color="#10b981" />
              <Text style={styles.successBlockText}>Excellent! No major skill gaps identified.</Text>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {currentAnalysis.MissingSkills.map((skill, idx) => (
                <View key={idx} style={styles.skillGapTag}>
                  <Text style={styles.skillGapText}>{skill}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Recommendations & Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Award size={18} color="#c084fc" />
          <Text style={styles.sectionTitle}>ATS Optimization Recommendations</Text>
        </View>
        <View style={styles.sectionBody}>
          {currentAnalysis.Suggestions.length === 0 ? (
            <Text style={styles.noDataText}>No recommendations available.</Text>
          ) : (
            <View style={styles.bullets}>
              {currentAnalysis.Suggestions.map((suggestion, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  header: {
    marginTop: 8,
    gap: 4,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateSub: {
    fontSize: 12,
    color: '#64748b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  statCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statRingText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statRingSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: -2,
  },
  statDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  deleteBtnText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: 'bold',
  },
  spinIcon: {
    opacity: 0.6,
  },
  rolePickerCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pickerGrid: {
    gap: 8,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 8,
  },
  pickerItemActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  pickerItemText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  pickerItemTextActive: {
    color: '#c084fc',
    fontWeight: 'bold',
  },
  pickerSubmitBtn: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  pickerSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  sectionBody: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  successBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successBlockText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillGapTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillGapText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
  },
  noDataText: {
    color: '#64748b',
    fontSize: 13,
  },
  bullets: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletPoint: {
    color: '#c084fc',
    fontSize: 16,
    marginTop: -2,
  },
  bulletText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
