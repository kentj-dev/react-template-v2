import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, Eye, Edit, Trash2, Globe, Activity } from 'lucide-react';

interface System {
    id: number;
    name: string;
    link: string;
    status: 'deployed' | 'ongoing' | 'maintenance' | 'offline';
    created_at: string;
    updated_at: string;
}

interface Props {
    systems: System[];
}

const SystemsIndex: React.FC<Props> = ({ systems }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredSystems = systems.filter(system => {
        const matchesSearch = system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            system.link.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || system.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'deployed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'offline':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'deployed':
                return <Activity className="w-4 h-4" />;
            case 'ongoing':
                return <Activity className="w-4 h-4" />;
            case 'maintenance':
                return <Activity className="w-4 h-4" />;
            case 'offline':
                return <Activity className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const handleAddSystem = () => {
        router.visit('/systems/create');
    };

    const handleViewSystem = (id: number) => {
        router.visit(`/systems/${id}`);
    };

    const handleEditSystem = (id: number) => {
        router.visit(`/systems/${id}/edit`);
    };

    const handleDeleteSystem = (id: number) => {
        if (confirm('Are you sure you want to delete this system?')) {
            router.delete(`/systems/${id}`);
        }
    };

    return (
        <>
            <Head title="Systems Management" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Systems Management</h1>
                                <p className="mt-2 text-gray-600">
                                    Manage system credentials and monitor deployment status
                                </p>
                            </div>
                            <button
                                onClick={handleAddSystem}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add System
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search systems..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="deployed">Deployed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Systems Grid */}
                    {filteredSystems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSystems.map((system) => (
                                <div
                                    key={system.id}
                                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                                >
                                    <div className="p-6">
                                        {/* System Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <Globe className="w-8 h-8 text-blue-600 mr-3" />
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {system.name}
                                                </h3>
                                            </div>
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(system.status)}`}>
                                                {getStatusIcon(system.status)}
                                                <span className="ml-1 capitalize">{system.status}</span>
                                            </div>
                                        </div>

                                        {/* System Link */}
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-500 mb-1">System URL</p>
                                            <a
                                                href={system.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                                            >
                                                {system.link}
                                            </a>
                                        </div>

                                        {/* Timestamps */}
                                        <div className="text-xs text-gray-500 mb-4">
                                            <p>Created: {new Date(system.created_at).toLocaleDateString()}</p>
                                            <p>Updated: {new Date(system.updated_at).toLocaleDateString()}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewSystem(system.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditSystem(system.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSystem(system.id)}
                                                className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Systems Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No systems match your current filters.'
                                    : 'Get started by adding your first system.'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <button
                                    onClick={handleAddSystem}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Your First System
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SystemsIndex;
