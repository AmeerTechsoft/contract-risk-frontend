import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Shield,
  Target,
  Calendar,
  Zap,
  Brain,
  MessageSquare,
  Star
} from 'lucide-react';
import { contractsAPI, analysisAPI, commentsAPI } from '../services/api';

const ContractDetail = () => {
  const { id } = useParams();
  
  const { data: contract, isLoading: contractLoading, error: contractError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsAPI.getContract(id),
  });

  // Get analysis data for processing time and other details
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisAPI.getResults(id),
    enabled: !!id,
  });

  // Get comments for the contract
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['contract-comments', id],
    queryFn: () => commentsAPI.getContractComments(id),
    enabled: !!id,
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  if (contractLoading || analysisLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Contract Not Found</h2>
          <p className="mt-2 text-gray-600">The contract you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="mt-4 btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {contract.title}
                </h1>
                <p className="text-sm text-gray-500 truncate">{contract.contract_type}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)} flex-shrink-0`}>
              {getStatusIcon(contract.status)}
              <span className="ml-1 capitalize">{contract.status}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Risk Score */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Risk Score</h3>
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-blue-600"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - (contract.risk_score || 0) / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {contract.risk_score || 0}
                    </div>
                    <div className="text-sm text-gray-500">/100</div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  (contract.risk_score || 0) >= 70 ? 'bg-red-100 text-red-800' :
                  (contract.risk_score || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {getRiskLevel(contract.risk_score || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors Count */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Risk Factors</h3>
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">
                {contract.risk_factors?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Identified</div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Analysis Time</h3>
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {analysis?.processing_time_seconds ? `${analysis.processing_time_seconds.toFixed(1)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Processing</div>
            </div>
          </div>

          {/* AI Model */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">AI Model</h3>
              <Brain className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analysis?.ai_model_used || 'Mock'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Analysis</div>
            </div>
          </div>
        </div>

        {/* Analysis Timeline */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Analysis Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm font-semibold">
                {contract.analysis_started_at ? new Date(contract.analysis_started_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold">
                {contract.analysis_completed_at ? new Date(contract.analysis_completed_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factors Details */}
        {contract.risk_factors && contract.risk_factors.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Risk Factors Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {contract.risk_factors.map((factor, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {factor.factor || factor.title || `Risk Factor ${index + 1}`}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (factor.risk_score || 0) >= 70 ? 'bg-red-100 text-red-800' :
                      (factor.risk_score || 0) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {factor.risk_score || 50}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{factor.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {contract.recommendations && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-indigo-600" />
              AI Recommendations
            </h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900 leading-relaxed">{contract.recommendations}</p>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Feedback & Comments
            {comments.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {comments.length}
              </span>
            )}
          </h3>
          
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading feedback...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No feedback yet</p>
              <p className="text-xs text-gray-400 mt-1">Share this contract to receive feedback</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{comment.commenter_name}</h4>
                    {comment.rating && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{comment.comment_text}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{comment.commenter_email}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetail; 