import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  BookCheck, 
  Database, 
  Users,
  TrendingUp,
  Plus 
} from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';
import { useProjectStore } from '../store/projectStore';
import { PROJECT_STATUS } from '../lib/constants';
import { FACULTY } from '../lib/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { projects, addProject } = useProjectStore();
  
  // Calculate statistics
  const totalProposals = projects.filter(p => p.type === 'proposal').length;
  const activeFinals = projects.filter(p => 
    p.type === 'final' && 
    p.status === PROJECT_STATUS.APPROVED
  ).length;
  const inventoryItems = projects.filter(p => 
    p.type === 'inventory' || 
    p.status === PROJECT_STATUS.ARCHIVED
  ).length;
  
  // Calculate total active advisers
  const activeAdvisers = new Set(
    projects
      .filter(p => p.status !== PROJECT_STATUS.ARCHIVED)
      .map(p => p.adviser)
  ).size;

  const stats = [
    { 
      name: 'Total Proposals', 
      value: totalProposals.toString(), 
      icon: FileText,
      path: '/proposals'
    },
    { 
      name: 'Active Finals', 
      value: activeFinals.toString(), 
      icon: BookCheck,
      path: '/finals'
    },
    { 
      name: 'Inventory Items', 
      value: inventoryItems.toString(), 
      icon: Database,
      path: '/inventory'
    },
    { 
      name: 'Active Advisers', 
      value: activeAdvisers.toString(), 
      icon: Users,
      path: '/faculty'
    },
  ];

  const cards = [
    {
      title: 'Proposals',
      description: 'View and manage capstone proposals',
      icon: FileText,
      path: '/proposals',
      color: 'bg-blue-500',
    },
    {
      title: 'Finals',
      description: 'Track final capstone projects',
      icon: BookCheck,
      path: '/finals',
      color: 'bg-green-500',
    },
    {
      title: 'Inventory',
      description: 'Browse completed projects',
      icon: Database,
      path: '/inventory',
      color: 'bg-purple-500',
    },
    {
      title: 'Faculty',
      description: 'Manage project advisers',
      icon: Users,
      path: '/faculty',
      color: 'bg-orange-500',
    },
  ];

  const handleAddProject = async (projectData: any) => {
    try {
      await addProject(projectData);
      setIsAddModalOpen(false);
      navigate(projectData.type === 'proposal' ? '/proposals' : '/finals');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  // Get recent activities
  const recentActivities = projects
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(project => ({
      id: project.id,
      title: project.title,
      type: project.type,
      status: project.status,
      date: project.createdAt
    }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Research
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 w-full text-left"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div
              className={`absolute right-4 top-4 w-8 h-8 rounded-full ${card.color} bg-opacity-10 flex items-center justify-center`}
            >
              <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                <p className="text-xs text-gray-500">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.status}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {activity.date.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </div>
  );
};

export default Dashboard;