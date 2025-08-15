import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Share2,
  FileText,
  Calendar,
  MessageSquare,
  X
} from 'lucide-react';
import { contractsAPI, commentsAPI } from '../services/api';
import ShareContractModal from '../components/ShareContractModal';

const Dashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    contract_type: '', // Remove default, make it required
    custom_type: '', // For custom contract types
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedContractForShare, setSelectedContractForShare] = useState(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contracts
  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsAPI.getAll(),
  });

  // Fetch unread comments count
  const { data: commentsData } = useQuery({
    queryKey: ['comments-count'],
    queryFn: () => commentsAPI.getUnreadCount(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data) => contractsAPI.upload(data.file, data.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts']);
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', contract_type: '', custom_type: '' });
      setSelectedFile(null);
      toast.success('Contract uploaded successfully!');
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (contractId) => contractsAPI.delete(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries(['contracts']);
      setDeleteConfirm(null);
      toast.success('Contract deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast.error('Delete failed. Please try again.');
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Validate custom type when selected
      if (uploadForm.contract_type === 'custom' && (!uploadForm.custom_type || !uploadForm.custom_type.trim())) {
        toast.warning('Please enter a custom contract type.');
        setIsUploading(false);
        return;
      }
      
      const normalizedContractType = uploadForm.contract_type === 'custom'
        ? uploadForm.custom_type.trim()
        : uploadForm.contract_type;
      
      await uploadMutation.mutateAsync({
        file: selectedFile,
        metadata: {
          title: uploadForm.title,
          description: uploadForm.description,
          contract_type: normalizedContractType,
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (contract) => {
    setDeleteConfirm(contract);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load contracts</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contract Dashboard</h1>
              <p className="text-sm text-gray-600">Manage and analyze your contracts</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Feedback Notification */}
              {commentsData && commentsData.total_comments > 0 && (
                <div className="relative">
                  <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="ml-2 text-sm font-medium text-blue-900">
                      {commentsData.total_comments} feedback
                    </span>
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {commentsData.contracts_with_comments} contracts
                    </span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Contract
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Processing</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Failed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Contracts</h3>
              <p className="mt-2 text-sm text-gray-700">
                A list of all your uploaded contracts and their analysis status.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                {/* Mobile view - Cards */}
                <div className="lg:hidden space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">{contract.title}</div>
                              <div className="text-sm text-gray-500 truncate">{contract.file_name}</div>
                              <div className="text-xs text-gray-400 mt-1">{contract.contract_type || 'General'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(contract.status)}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {contract.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/contracts/${contract.id}`}
                              className="text-primary-600 hover:text-primary-900 p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedContractForShare(contract);
                                setShowShareModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 p-1"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contract)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view - Table */}
                <table className="min-w-full divide-y divide-gray-300 hidden lg:table">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Contract
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Uploaded
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{contract.title}</div>
                              <div className="text-gray-500">{contract.file_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {contract.contract_type || 'General'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(contract.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {contract.status}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {new Date(contract.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/contracts/${contract.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedContractForShare(contract);
                                setShowShareModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contract)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {contracts.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by uploading your first contract.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Upload Contract
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-w-md mx-auto">
              <form onSubmit={handleUpload}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Upload className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Upload Contract
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Contract File
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileSelect}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                            className="input-field mt-1"
                            placeholder="Contract title"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                            className="input-field mt-1"
                            rows={3}
                            placeholder="Brief description of the contract"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Contract Type *
                          </label>
                          <select
                            value={uploadForm.contract_type}
                            onChange={(e) => {
                              const value = e.target.value;
                              setUploadForm(prev => ({
                                ...prev,
                                contract_type: value,
                                custom_type: value === 'custom' ? prev.custom_type : ''
                              }));
                            }}
                            className="input-field mt-1"
                            required
                          >
                            <option value="">Select type</option>
                            <option value="Employment">Employment</option>
                            <option value="Vendor">Vendor</option>
                            <option value="NDA">NDA</option>
                            <option value="Service">Service</option>
                            <option value="Lease">Lease</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Licensing">Licensing</option>
                            <option value="Purchase">Purchase</option>
                            <option value="custom">Other (Custom)</option>
                          </select>
                          
                          {uploadForm.contract_type === 'custom' && (
                            <input
                              type="text"
                              placeholder="Enter custom contract type"
                              value={uploadForm.custom_type || ''}
                              onChange={(e) => setUploadForm(prev => ({ 
                                ...prev, 
                                custom_type: e.target.value
                              }))}
                              className="input-field mt-2"
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Contract'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Deletion
                    </h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
                      </p>
                    </div>
                    <div className="items-center px-4 py-3">
                      <button
                        onClick={confirmDelete}
                        className="btn-danger w-full sm:w-auto"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Contract Modal */}
      {showShareModal && selectedContractForShare && (
        <ShareContractModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedContractForShare(null);
          }}
          contractId={selectedContractForShare.id}
          contractTitle={selectedContractForShare.title}
        />
      )}
    </div>
  );
};

export default Dashboard; 