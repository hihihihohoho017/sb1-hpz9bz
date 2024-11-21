import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle, FileText, Building2, GraduationCap, Users, BookOpen } from 'lucide-react';
import { COLLEGES, DEPARTMENTS, PROJECT_STATUS, PROJECT_PROGRESS } from '../lib/constants';
import { useFacultyStore } from '../store/facultyStore';
import { useProjectStore } from '../store/projectStore';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
  type?: 'proposal' | 'final' | 'inventory';
}

const AddProjectModal = ({ isOpen, onClose, onSubmit, type = 'proposal' }: AddProjectModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    college: '',
    department: '',
    adviser: '',
    members: [''],
    description: '',
    type: type
  });
  const [error, setError] = useState('');
  const [similarProjects, setSimilarProjects] = useState<any[]>([]);
  const { searchSimilarProjects } = useProjectStore();
  const { faculty, fetchFaculty } = useFacultyStore();

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const availableDepartments = formData.college
    ? DEPARTMENTS[formData.college as keyof typeof DEPARTMENTS] || []
    : [];

  const availableAdvisers = faculty
    .filter(f => f.college === formData.college && f.department === formData.department)
    .map(f => f.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Project title is required');
      }

      if (!formData.college) {
        throw new Error('College is required');
      }

      if (!formData.department) {
        throw new Error('Department is required');
      }

      if (!formData.adviser) {
        throw new Error('Adviser is required');
      }

      if (!formData.members.some(member => member.trim())) {
        throw new Error('At least one group member is required');
      }

      if (!formData.description.trim()) {
        throw new Error('Project description is required');
      }

      const projectData = {
        ...formData,
        members: formData.members.filter(member => member.trim())
      };

      // If it's an inventory type, set the status as completed and progress as final
      if (formData.type === 'inventory') {
        projectData.status = PROJECT_STATUS.APPROVED;
        projectData.progress = PROJECT_PROGRESS.FINAL_DEFENDED;
      }

      await onSubmit(projectData);
      setFormData({
        title: '',
        college: '',
        department: '',
        adviser: '',
        members: [''],
        description: '',
        type: type
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, '']
    }));
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleMemberChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => (i === index ? value : member))
    }));
  };

  useEffect(() => {
    const checkSimilarTitles = async () => {
      if (formData.title.trim().length >= 3) {
        const similar = await searchSimilarProjects(formData.title);
        setSimilarProjects(similar);
      } else {
        setSimilarProjects([]);
      }
    };

    checkSimilarTitles();
  }, [formData.title, searchSimilarProjects]);

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
            Add Research
          </Dialog.Title>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {similarProjects.length > 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm font-medium text-yellow-800 mb-2">Similar Research found:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {similarProjects.map((project, index) => (
                  <li key={index}>{project.title}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research Type
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'proposal' | 'final' | 'inventory' })}
                >
                  <option value="proposal">Capstone Proposal</option>
                  <option value="final">Final Capstone</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research Title
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  placeholder="Enter Research title"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, college: e.target.value, department: '', adviser: '' })}
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
                    onChange={(e) => setFormData({ ...formData, department: e.target.value, adviser: '' })}
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

            {formData.department && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adviser
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={formData.adviser}
                    onChange={(e) => setFormData({ ...formData, adviser: e.target.value })}
                  >
                    <option value="">Select Adviser</option>
                    {availableAdvisers.map((adviser) => (
                      <option key={adviser} value={adviser}>
                        {adviser}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Members
              </label>
              <div className="space-y-2">
                {formData.members.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Member ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                    />
                    {formData.members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Member
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                placeholder="Enter Research description"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Research
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default AddProjectModal;