import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProjectTable from '../components/ProjectTable';
import ProjectModal from '../components/ProjectModal';
import DefenseScheduleModal from '../components/DefenseScheduleModal';
import { COLLEGES } from '../lib/constants';
import { useProjectStore } from '../store/projectStore';

const Finals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    projects, 
    loading, 
    error: storeError,
    fetchProjects, 
    updateProjectStatus,
    updateProjectProgress,
    deleteProject,
    moveToInventory
  } = useProjectStore();

  useEffect(() => {
    fetchProjects().catch(err => {
      setError(err.message);
    });
  }, [fetchProjects]);

  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  const finals = projects.filter(project => project.type === 'final');

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setError(null);
      await updateProjectStatus(id, status);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      if (window.confirm('Are you sure you want to delete this project?')) {
        await deleteProject(id);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleMoveToInventory = async (id: string) => {
    try {
      setError(null);
      if (window.confirm('Are you sure you want to move this project to inventory?')) {
        await moveToInventory(id);
        setIsModalOpen(false);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error moving to inventory:', err);
    }
  };

  const handleSchedule = (project: any) => {
    setSelectedProject(project);
    setIsScheduleModalOpen(true);
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const filteredFinals = finals.filter(
    (final) =>
      final.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCollege || final.college === selectedCollege)
  );

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search finals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="">All Colleges</option>
              {COLLEGES.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ProjectTable
        projects={filteredFinals}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onSchedule={handleSchedule}
        onViewDetails={handleViewDetails}
      />

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        project={selectedProject}
        onMoveToInventory={handleMoveToInventory}
        showMoveToInventory={true}
        error={error}
      />

      <DefenseScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setError(null);
        }}
        project={selectedProject}
      />
    </div>
  );
};

export default Finals;