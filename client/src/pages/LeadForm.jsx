import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // Fetch lead data if editing
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await api.get(`/leads/${id}`);
      return response.data.lead;
    },
    enabled: isEditing,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        const response = await api.put(`/leads/${id}`, data);
        return response.data;
      } else {
        const response = await api.post('/leads', data);
        return response.data;
      }
    },
    onSuccess: async (result) => {
      // Note: AlchemystAI integration happens automatically on the backend for new leads
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-leads'] });
      navigate('/leads');
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'An error occurred');
    },
  });

  // Reset form when lead data is loaded
  useEffect(() => {
    if (lead && isEditing) {
      reset({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
        position: lead.position || '',
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        estimatedValue: lead.estimatedValue || '',
        probability: lead.probability || 0,
        expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.split('T')[0] : '',
        notes: lead.notes || '',
        tags: lead.tags ? lead.tags.join(', ') : '',
      });
    }
  }, [lead, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert tags string to array
      if (data.tags) {
        data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      // Convert numeric fields
      if (data.estimatedValue) {
        data.estimatedValue = Number(data.estimatedValue);
      }
      if (data.probability) {
        data.probability = Number(data.probability);
      }

      // Remove empty fields
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null || data[key] === undefined) {
          delete data[key];
        }
      });

      await mutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/leads" className="btn btn-outline btn-sm">
            <ArrowLeft className="btn-icon" />
            Back
          </Link>
          <div>
            <h1 className="card-title">
              {isEditing ? 'Edit Lead' : 'Add New Lead'}
            </h1>
            <p className="card-subtitle">
              {isEditing ? 'Update lead information' : 'Create a new sales lead'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  {...register('phone')}
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Company Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('company')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Position</label>
                <input
                  type="text"
                  className="form-input"
                  {...register('position')}
                />
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Lead Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" {...register('source')}>
                  <option value="website">Website</option>
                  <option value="social_media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="email_campaign">Email Campaign</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" {...register('status')}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Value ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  {...register('estimatedValue')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  {...register('probability')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Close Date</label>
                <input
                  type="date"
                  className="form-input"
                  {...register('expectedCloseDate')}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Additional Information</h3>
            
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter tags separated by commas"
                {...register('tags')}
              />
              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                Example: hot-lead, enterprise, decision-maker
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Add any additional notes about this lead..."
                {...register('notes')}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="btn btn-primary"
            >
              <Save className="btn-icon" />
              {isSubmitting || mutation.isPending 
                ? 'Saving...' 
                : isEditing ? 'Update Lead' : 'Create Lead'
              }
            </button>
            
            <Link to="/leads" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm; 