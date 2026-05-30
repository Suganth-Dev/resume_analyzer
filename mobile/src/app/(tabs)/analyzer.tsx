import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useResumeStore } from '../../store/resumeStore';
import { JOB_ROLES } from '../../constants/jobRoles';
import { FileUp, FileText, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function AnalyzerScreen() {
  const router = useRouter();
  const { uploadResume, uploading, uploadProgress, error } = useResumeStore();

  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0]);
  const [file, setFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [localError, setLocalError] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handlePickDocument = async () => {
    setLocalError('');
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        
        // Enforce 5MB limit matching the backend rules
        const sizeMb = asset.size ? asset.size / (1024 * 1024) : 0;
        if (sizeMb > 5) {
          setLocalError('File size exceeds 5MB limit.');
          return;
        }

        setFile({
          uri: asset.uri,
          name: asset.name || 'resume.pdf',
          type: asset.mimeType || 'application/pdf',
        });
      }
    } catch (err) {
      console.warn('Error picking document:', err);
      setLocalError('Failed to pick document.');
    }
  };

  const handleAnalyze = async () => {
    setLocalError('');
    if (!file) {
      setLocalError('Please select a PDF resume.');
      return;
    }

    const result = await uploadResume(file.uri, file.name, file.type, selectedRole);
    if (result.success && result.data) {
      // Clear file selection and navigate to details
      setFile(null);
      router.push(`/analysis/${result.data._id}`);
    } else {
      setLocalError(result.message || 'Analysis failed.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ATS Optimization Scanner</Text>
        <Text style={styles.subtext}>Align your credentials to MERN & tech stack positions</Text>
      </View>

      <View style={styles.card}>
        {/* Job Role Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Job Role</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowRolePicker(!showRolePicker)}
          >
            <Text style={styles.dropdownText}>{selectedRole}</Text>
          </TouchableOpacity>

          {showRolePicker && (
            <View style={styles.pickerOverlay}>
              {JOB_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.pickerItem, role === selectedRole && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedRole(role);
                    setShowRolePicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, role === selectedRole && styles.pickerItemTextActive]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Upload Zone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Upload PDF Resume</Text>
          
          <TouchableOpacity 
            style={[styles.uploadZone, file && styles.uploadZoneActive]}
            onPress={handlePickDocument}
            disabled={uploading}
          >
            {file ? (
              <View style={styles.uploadZoneContent}>
                <CheckCircle2 size={38} color="#10b981" />
                <Text style={styles.uploadFileTitle}>{file.name}</Text>
                <Text style={styles.uploadFileSub}>Tap to change resume file</Text>
              </View>
            ) : (
              <View style={styles.uploadZoneContent}>
                <FileUp size={38} color="#64748b" />
                <Text style={styles.uploadPrompt}>Select PDF Document</Text>
                <Text style={styles.uploadConstraints}>PDF format only, maximum 5MB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Error messaging */}
        {(localError || error) ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#f87171" />
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        ) : null}

        {/* Upload progress indicator */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>Analyzing Resume... {uploadProgress}%</Text>
          </View>
        )}

        {/* Submit action */}
        <TouchableOpacity
          style={[styles.analyzeButton, (!file || uploading) && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={!file || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
          )}
        </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 20,
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 14,
  },
  pickerOverlay: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  pickerItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  pickerItemText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  pickerItemTextActive: {
    color: '#c084fc',
    fontWeight: 'bold',
  },
  uploadZone: {
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 12,
    paddingVertical: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadZoneActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  uploadZoneContent: {
    alignItems: 'center',
    gap: 12,
  },
  uploadPrompt: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  uploadConstraints: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  uploadFileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  uploadFileSub: {
    fontSize: 12,
    color: '#64748b',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    flex: 1,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
