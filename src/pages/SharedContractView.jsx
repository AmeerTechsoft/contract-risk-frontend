import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  ArrowLeft,
  Target,
  Shield,
  Zap,
  Brain,
  Calendar
} from 'lucide-react';
import { sharingAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const SharedContractView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    commenter_name: '',
    commenter_email: '',
    comment_text: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const getRiskColor = (score) => {
    if ((score || 0) >= 70) return '#ef4444';
    if ((score || 0) >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLevel = (score) => {
    if ((score || 0) >= 70) return 'High Risk';
    if ((score || 0) >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

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

  useEffect(() => {
    loadSharedContract();
  }, [token]);

  const loadSharedContract = async () => {
    try {
      const data = await sharingAPI.getSharedContract(token);
      setContract(data.contract);
      setAnalysis(data.analysis || null);
      setComments(data.comments || []);
    } catch (err) {
      setError('This share link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sharingAPI.submitFeedback(token, feedbackForm);
      setFeedbackForm({ commenter_name: '', commenter_email: '', comment_text: '', rating: 5 });
      setShowFeedback(false);
      const refreshed = await sharingAPI.getSharedComments(token);
      setComments(refreshed);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Link Expired</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="mr-4 p-2 rounded-md hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{contract.title}</h1>
                <p className="text-sm text-gray-500 truncate">{contract.contract_type}</p>
              </div>
            </div>
            <button onClick={() => setShowFeedback(true)} className="btn-primary flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Feedback
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Risk Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Risk Score</h3>
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
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
                    style={{ stroke: getRiskColor(contract.risk_score || 0) }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getRiskColor(contract.risk_score || 0) }}>
                      {contract.risk_score || 0}
                    </div>
                    <div className="text-sm text-gray-500">/100</div>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className="px-2 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: getRiskColor(contract.risk_score || 0) + '20', color: getRiskColor(contract.risk_score || 0) }}
                >
                  {getRiskLevel(contract.risk_score || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors Count */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Risk Factors</h3>
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{contract.risk_factors?.length || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Identified</div>
            </div>
          </div>

          {/* Analysis Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Analysis Time</h3>
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analysis?.processing_time_seconds ? `${analysis.processing_time_seconds.toFixed(1)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Processing</div>
            </div>
          </div>

          {/* AI Model */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">AI Model</h3>
              <Brain className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{analysis?.ai_model_used || 'Mock'}</div>
              <div className="text-sm text-gray-500 mt-1">Analysis</div>
            </div>
          </div>
        </div>

        {/* Analysis Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Analysis Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Started</span>
              <span className="text-sm font-semibold">
                {analysis?.started_at ? new Date(analysis.started_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold">
                {analysis?.completed_at ? new Date(analysis.completed_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Details and Risk Factors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Contract Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {getStatusIcon(contract.status)}
                  <span className="ml-1 capitalize">{contract.status}</span>
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{contract.contract_type}</p>
                </div>
                {contract.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.description}</p>
                  </div>
                )}
                {contract.recommendations && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                    <p className="mt-1 text-sm text-gray-900">{contract.recommendations}</p>
                  </div>
                )}
              </div>
            </div>

            {contract.risk_factors && contract.risk_factors.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
                <div className="space-y-3">
                  {contract.risk_factors.map((factor, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{factor.factor || factor.title || `Risk Factor ${index + 1}`}</p>
                        <p className="text-sm text-gray-600">{factor.description || 'No description available'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No feedback yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{comment.commenter_name}</h4>
                        {comment.rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{comment.comment_text}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Feedback</h3>
                    <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Your Name *</label>
                        <input type="text" required value={feedbackForm.commenter_name} onChange={(e) => setFeedbackForm(prev => ({ ...prev, commenter_name: e.target.value }))} className="input-field mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                        <input type="email" value={feedbackForm.commenter_email} onChange={(e) => setFeedbackForm(prev => ({ ...prev, commenter_email: e.target.value }))} className="input-field mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button key={rating} type="button" onClick={() => setFeedbackForm(prev => ({ ...prev, rating }))} className="p-1">
                              <Star className={`h-6 w-6 ${rating <= feedbackForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Feedback *</label>
                        <textarea required rows={4} value={feedbackForm.comment_text} onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment_text: e.target.value }))} className="input-field mt-1" placeholder="Share your thoughts about this contract..." />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="submit" onClick={handleFeedbackSubmit} disabled={submitting} className="btn-primary w-full sm:w-auto sm:ml-3">
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button type="button" onClick={() => setShowFeedback(false)} className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedContractView; 