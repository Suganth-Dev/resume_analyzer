import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-toastify';
import { 
  Users, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2 
} from 'lucide-react';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import ConfirmModal from '../../components/common/ConfirmModal';

const UsersManagement = () => {
  const { users, fetchAdminUsers, updateAdminUser, deleteAdminUser, loading } = useAdminStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAdminUser(deleteTarget.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('User and associated resume data deleted successfully.');
      setDeleteTarget(null);
      fetchAdminUsers();
    } else {
      toast.error('Failed to delete user.');
    }
  };


  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      toast.error('Name and Email are required.');
      return;
    }

    setSaving(true);
    const result = await updateAdminUser(editingUser._id, editForm);
    setSaving(false);
    
    if (result.success) {
      toast.success('User updated successfully.');
      closeEditModal();
      fetchAdminUsers();
    } else {
      toast.error('Failed to update user.');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">User Management</h1>
          <p className="text-sm text-dark-400">View and manage all registered candidates on the platform</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
        />
      </div>

      {/* Content */}
      {loading && users.length === 0 ? (
        <TableSkeleton />
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-dark-800/80 text-center py-16">
          <Users className="w-16 h-16 text-rose-500 mb-6 mx-auto" />
          <h2 className="text-xl font-bold text-white mb-2">No Candidates Found</h2>
          <p className="text-sm text-dark-400">Try adjusting your search criteria or register a new candidate.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-dark-800/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-dark-850 bg-dark-900/40 text-xs font-bold text-dark-300 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">System Role</th>
                  <th className="py-4 px-6">Date Joined</th>
                  <th className="py-4 px-6 text-center">Resumes</th>
                  <th className="py-4 px-6 text-center">Avg score</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-850/60 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-dark-900/20 transition-colors text-dark-200">
                    <td className="py-4 px-6 font-semibold text-white truncate max-w-[180px]">{user.name}</td>
                    <td className="py-4 px-6 truncate max-w-[200px]">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                        user.role === 'admin' 
                          ? 'bg-rose-950/40 border-rose-800/40 text-rose-400' 
                          : 'bg-dark-900 border-dark-800 text-dark-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-dark-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-white">{user.totalResumes}</td>
                    <td className="py-4 px-6 text-center font-bold">
                      <span className={
                        user.averageScore >= 80 ? 'text-emerald-400' :
                        user.averageScore >= 60 ? 'text-amber-400' : 'text-dark-400'
                      }>
                        {user.averageScore ? `${user.averageScore}/100` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/user/${user._id}`)}
                          className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors"
                          title="View Portfolio"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-dark-400 hover:text-white rounded hover:bg-dark-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: user._id, name: user.name })}
                          className="p-1.5 text-dark-400 hover:text-red-400 rounded hover:bg-red-950/10 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-dark-800 shadow-2xl relative">
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-1 text-dark-400 hover:text-white rounded hover:bg-dark-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6">Edit User Profile</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">System Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-sm text-white cursor-pointer"
                >
                  <option value="user" className="bg-dark-900">User</option>
                  <option value="admin" className="bg-dark-900">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 font-semibold text-sm text-white hover:brightness-110 disabled:brightness-75 transition-all shadow-md mt-6 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Account"
        message={`Are you sure you want to delete the user "${deleteTarget?.name}" and all their resume analyses? This action is irreversible.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersManagement;
