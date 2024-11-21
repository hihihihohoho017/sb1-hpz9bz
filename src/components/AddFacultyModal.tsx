import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle, User, Building2, GraduationCap } from 'lucide-react';
import { COLLEGES, DEPARTMENTS } from '../lib/constants';
import { useFacultyStore } from '../store/facultyStore';

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFacultyModal = ({ isOpen, onClose }: AddFacultyModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    department: ''
  });
  const [error, setError] = useState('');
  const { addFaculty, loading } = useFacultyStore();

  const availableDepartments = formData.college
    ? DEPARTMENTS[formData.college as keyof typeof DEPARTMENTS] || []
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Faculty name is required');
      }

      if (!formData.college) {
        throw new Error('College is required');
      }

      if (!formData.department) {
        throw new Error('Department is required');
      }

      await addFaculty({
        name: formData.name.trim(),
        college: formData.college,
        department: formData.department
      });

      setFormData({
        name: '',
        college: '',
        department: ''
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
            Add New Faculty Member
          </Dialog.Title>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  placeholder="Enter faculty name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value, department: '' })}
                >
                  <option value="">Select College</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {availableDepartments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Faculty'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default AddFacultyModal;