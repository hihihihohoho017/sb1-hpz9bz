import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Trash2, 
  Calendar,
  ChevronDown,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { PROJECT_STATUS } from '../lib/constants';

interface ProjectTableProps {
  projects: any[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (project: any) => void;
  onViewDetails: (project: any) => void;
  disableStatusChange?: boolean;
}

const ProjectTable = ({
  projects,
  onStatusChange,
  onDelete,
  onSchedule,
  onViewDetails,
  disableStatusChange = false
}: ProjectTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const getStatusBadge = (status: string, defenseResult?: string) => {
    let baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    if (defenseResult === 'passed') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle className="w-4 h-4 mr-1" />
          Passed
        </span>
      );
    } else if (defenseResult === 'failed') {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircle className="w-4 h-4 mr-1" />
          Failed
        </span>
      );
    }

    switch (status) {
      case PROJECT_STATUS.PENDING:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case PROJECT_STATUS.APPROVED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case PROJECT_STATUS.REJECTED:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adviser
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProjects.map((project) => (
              <tr
                key={project.id}
                onClick={() => onViewDetails(project)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {project.title}
                  </div>
                  {project.defenseSchedule && (
                    <div className="text-xs text-gray-500 mt-1">
                      Defense: {format(new Date(project.defenseSchedule), 'PPp')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{project.college}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{project.adviser}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {disableStatusChange ? (
                      <span className={getStatusBadge(PROJECT_STATUS.COMPLETED)}>
                        {PROJECT_STATUS.COMPLETED}
                      </span>
                    ) : (
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button
                          className={`${getStatusBadge(project.status, project.defenseResult)} cursor-pointer`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.defenseResult ? project.defenseResult : project.status}
                          {!project.defenseResult && <ChevronDown className="ml-2 h-4 w-4" />}
                        </Menu.Button>
                        {!project.defenseResult && (
                          <div className="relative">
                            <Menu.Items className="absolute left-0 z-50 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                {Object.values(PROJECT_STATUS).map((status) => (
                                  <Menu.Item key={status}>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onStatusChange(project.id, status);
                                        }}
                                      >
                                        {status}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                              </div>
                            </Menu.Items>
                          </div>
                        )}
                      </Menu>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {!project.defenseSchedule && project.status === PROJECT_STATUS.APPROVED && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSchedule(project);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* Add empty rows to maintain consistent height */}
            {currentProjects.length < itemsPerPage && Array.from({ length: itemsPerPage - currentProjects.length }).map((_, index) => (
              <tr key={`empty-${index}`} className="h-[69px]">
                <td colSpan={5}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center space-x-2 pl-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProjectTable;