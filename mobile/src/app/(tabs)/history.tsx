import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useResumeStore } from '../../store/resumeStore';
import { Search, Trash2, ChevronRight, Filter } from 'lucide-react-native';
import { JOB_ROLES } from '../../constants/jobRoles';

export default function HistoryScreen() {
  const router = useRouter();
  const { resumes, loading, fetchResumes, deleteResume } = useResumeStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResumes(search, roleFilter);
  }, [search, roleFilter]);

  const handleDelete = (id: string, roleName: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the analysis for "${roleName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteResume(id);
            if (result.success) {
              Alert.alert('Success', 'Resume assessment deleted.');
            } else {
              Alert.alert('Error', result.message || 'Failed to delete resume.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assessments..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity 
          style={[styles.filterBtn, roleFilter !== '' && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={roleFilter !== '' ? '#c084fc' : '#94a3b8'} />
        </TouchableOpacity>
      </View>

      {/* Role Filters panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Filter by Job Role</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[styles.chip, roleFilter === '' && styles.chipActive]}
              onPress={() => setRoleFilter('')}
            >
              <Text style={[styles.chipText, roleFilter === '' && styles.chipTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            {JOB_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.chip, roleFilter === role && styles.chipActive]}
                onPress={() => setRoleFilter(role)}
              >
                <Text style={[styles.chipText, roleFilter === role && styles.chipTextActive]}>
                  {role.split(' ')[0]} {/* shortened */}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* List Container */}
      {loading && resumes.length === 0 ? (
        <ActivityIndicator color="#c084fc" style={{ marginTop: 40 }} />
      ) : resumes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matching resume evaluations found.</Text>
        </View>
      ) : (
        <FlatList
          data={resumes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={() => fetchResumes(search, roleFilter)}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <TouchableOpacity
                style={styles.itemClickArea}
                onPress={() => router.push(`/analysis/${item._id}`)}
              >
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.SelectedJobRole}</Text>
                  <Text style={styles.itemDate}>
                    {new Date(item.CreatedAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={[
                  styles.scoreBadge,
                  { backgroundColor: item.ResumeScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.15)' }
                ]}>
                  <Text style={[
                    styles.scoreText,
                    { color: item.ResumeScore >= 80 ? '#10b981' : '#c084fc' }
                  ]}>
                    {item.ResumeScore}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id, item.SelectedJobRole)}
              >
                <Trash2 size={16} color="#f87171" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    height: '100%',
  },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  filterPanel: {
    backgroundColor: '#0f172a',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  filterLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  itemClickArea: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemDate: {
    fontSize: 12,
    color: '#64748b',
  },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 38,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(51, 65, 85, 0.3)',
  },
});
