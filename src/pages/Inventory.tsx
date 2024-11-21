import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import ProjectTable from '../components/ProjectTable';
import ProjectModal from '../components/ProjectModal';
import { COLLEGES, PROJECT_STATUS } from '../lib/constants';
import { useProjectStore } from '../store/projectStore';
import { debounce } from '../utils/debounce';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarProjects, setSimilarProjects] = useState<any[]>([]);
  const [showSimilarityWarning, setShowSimilarityWarning] = useState(false);

  const { 
    projects, 
    loading, 
    error,
    fetchProjects, 
    deleteProject,
    searchSimilarProjects
  } = useProjectStore();

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      if (value.length >= 3) {
        const similar = await searchSimilarProjects(value);
        setSimilarProjects(similar);
        setShowSimilarityWarning(similar.length > 0);
      } else {
        setSimilarProjects([]);
        setShowSimilarityWarning(false);
      }
    }, 300),
    [searchSimilarProjects]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const inventoryProjects = projects.filter(project => 
    project.type === 'inventory' || project.status === PROJECT_STATUS.ARCHIVED
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const filteredInventory = inventoryProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCollege || project.college === selectedCollege)
  );

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {showSimilarityWarning && (
              <div className="absolute z-10 w-full mt-1 bg-yellow-50 border border-yellow-200 rounded-md divide-y divide-yellow-200">
                {similarProjects.map((project, index) => (
                  <div key={index} className="p-2 text-sm text-yellow-800">
                    {project.title}
                  </div>
                ))}
              </div>
            )}
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
        projects={filteredInventory}
        onStatusChange={() => {}}
        onDelete={handleDelete}
        onSchedule={() => {}}
        onViewDetails={handleViewDetails}
        disableStatusChange={true}
      />

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </div>
  );
};

export default Inventory;