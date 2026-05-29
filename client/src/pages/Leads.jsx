import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', { page: currentPage, search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/leads?${params}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId) => {
      await api.delete(`/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });

  const handleDeleteLead = async (lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`)) {
      try {
        await deleteMutation.mutateAsync(lead._id);
      } catch (error) {
        alert('Failed to delete lead');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state">
          <p>Error loading leads: {error.message}</p>
        </div>
      </div>
    );
  }

  const leads = data?.leads || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      {/* Header Section */}
      <div className="card-header">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-2)'
        }}>
          <div>
            <h1 className="card-title">Leads</h1>
            <p className="card-subtitle">
              Manage your sales leads and track your pipeline
            </p>
          </div>
          <Link to="/leads/new" className="btn btn-primary">
            <Plus className="btn-icon" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Search and Filters */}
        <form onSubmit={handleSearch} className="search-filters">
          <div className="search-input">
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 'var(--space-3)', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--color-gray-400)' 
                }} 
              />
              <input
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ 
                  paddingLeft: '2.5rem',
                  background: 'var(--color-gray-50)',
                  border: '1px solid var(--color-gray-200)'
                }}
              />
            </div>
          </div>
          
          <div className="filter-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{
                background: 'var(--color-gray-50)',
                border: '1px solid var(--color-gray-200)'
              }}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
          </div>

          <button type="submit" className="btn btn-outline">
            <Filter className="btn-icon" />
            Apply Filters
          </button>
        </form>

        {/* Results Summary */}
        {leads.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3)',
            background: 'var(--color-gray-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-gray-200)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-gray-600)',
              fontWeight: '500'
            }}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total || 0)} of {pagination.total || 0} leads
            </div>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="btn btn-ghost btn-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Leads Table */}
        {leads.length > 0 ? (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Value</th>
                    <th>Created</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <div>
                          <div style={{ 
                            fontWeight: '600',
                            color: 'var(--color-gray-900)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-gray-500)'
                          }}>
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div style={{ 
                              fontSize: 'var(--font-size-xs)', 
                              color: 'var(--color-gray-400)',
                              marginTop: 'var(--space-1)'
                            }}>
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{
                        color: 'var(--color-gray-700)',
                        fontWeight: '500'
                      }}>
                        {lead.company || '-'}
                      </td>
                      <td>
                        <span className={`status-badge status-${lead.status}`}>
                          {lead.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td style={{ 
                        textTransform: 'capitalize',
                        color: 'var(--color-gray-600)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {lead.source.replace('_', ' ')}
                      </td>
                      <td style={{
                        fontWeight: '600',
                        color: 'var(--color-gray-800)'
                      }}>
                        {lead.estimatedValue 
                          ? `$${lead.estimatedValue.toLocaleString()}` 
                          : '-'
                        }
                      </td>
                      <td style={{
                        color: 'var(--color-gray-500)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          gap: 'var(--space-2)',
                          alignItems: 'center'
                        }}>
                          <Link 
                            to={`/leads/edit/${lead._id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: 'var(--space-2)' }}
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDeleteLead(lead)}
                            className="btn btn-ghost btn-sm"
                            style={{ 
                              padding: 'var(--space-2)',
                              color: 'var(--color-error)'
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Page {currentPage} of {pagination.totalPages}
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="btn btn-outline btn-sm"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3 className="empty-state-title">
              {searchTerm || statusFilter ? 'No leads found' : 'No leads yet'}
            </h3>
            <p style={{ 
              color: 'var(--color-gray-500)', 
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--font-size-base)'
            }}>
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start building your pipeline by adding your first lead.'
              }
            </p>
            {!(searchTerm || statusFilter) && (
              <Link to="/leads/new" className="btn btn-primary">
                <Plus className="btn-icon" />
                Add Your First Lead
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads; 