import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Target, DollarSign, ArrowRight, Plus, Database, CheckCircle, Zap } from 'lucide-react';
import api from '../utils/api';
import alchemystIntegration from '../utils/alchemyst-api';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => {
      const response = await api.get('/leads/stats/summary');
      console.log('Stats API response:', response.data);
      return response.data;
    },
  });

  const { data: recentLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: async () => {
      const response = await api.get('/leads?limit=5&sortBy=createdAt&sortOrder=desc');
      return response.data.leads;
    },
  });

  // Add AlchemystAI status check
  const { data: alchemystStatus } = useQuery({
    queryKey: ['alchemyst-status'],
    queryFn: async () => {
      try {
        const result = await alchemystIntegration.testConnection();
        return result;
      } catch (error) {
        console.error('AlchemystAI status check failed:', error);
        return { success: false, error: error.message };
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Add AlchemystAI total count check
  const { data: alchemystLeadCount } = useQuery({
    queryKey: ['alchemyst-lead-count'],
    queryFn: async () => {
      try {
        // Search for a broad term to get total lead count
        const response = await alchemystIntegration.searchContext('firstName', 'crm_user');
        if (response.success && response.data) {
          // Count unique lead files
          const leadFiles = new Set();
          response.data.forEach(context => {
            const fileName = context.metadata?.file_name || context.metadata?.fileName;
            if (fileName && fileName.startsWith('lead_') && fileName.endsWith('.json')) {
              leadFiles.add(fileName);
            }
          });
          return leadFiles.size;
        }
        return 0;
      } catch (error) {
        console.error('Failed to get AlchemystAI lead count:', error);
        return 0;
      }
    },
  });

  // Function to sync all leads
  const syncAllLeads = async () => {
    try {
      const response = await api.post('/leads/refresh');
      console.log('Sync result:', response.data);
      // Refresh all queries
      window.location.reload();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'var(--color-primary)', isLeadCard = false }) => (
    <div className="stat-card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--space-4)' 
      }}>
        <div style={{ flex: 1 }}>
          <div className="stat-value">
            {isLeadCard && alchemystLeadCount && alchemystLeadCount > (value || 0) ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span>{value || 0}</span>
                <span style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-warning)',
                  fontWeight: '600' 
                }}>
                  of {alchemystLeadCount}
                </span>
              </div>
            ) : (
              typeof value === 'object' ? JSON.stringify(value) : value
            )}
          </div>
          <div className="stat-label">
            {title}
            {isLeadCard && alchemystLeadCount && alchemystLeadCount > (value || 0) && (
              <div style={{ 
                marginTop: 'var(--space-1)', 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-warning)' 
              }}>
                {alchemystLeadCount - (value || 0)} more in AlchemystAI
              </div>
            )}
          </div>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: `${color}10`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      {change && (
        <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↗️' : '↘️'} {change > 0 ? '+' : ''}{change}% from last month
        </div>
      )}
      {isLeadCard && alchemystLeadCount && alchemystLeadCount > (value || 0) && (
        <button 
          onClick={syncAllLeads}
          style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-warning)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <Database size={12} />
          Sync All Leads
        </button>
      )}
    </div>
  );

  if (statsLoading || leadsLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <div>
      {/* Header Section with AlchemystAI Status */}
      <div className="card-header">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-4)'
        }}>
          <div>
            <h1 className="card-title">Dashboard</h1>
            <p className="card-subtitle">
              Welcome back! Here's an overview of your sales pipeline today.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {/* AlchemystAI Status Indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)',
              background: alchemystStatus?.success ? 'var(--color-success)10' : 'var(--color-warning)10',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${alchemystStatus?.success ? 'var(--color-success)' : 'var(--color-warning)'}20`
            }}>
              {alchemystStatus?.success ? (
                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
              ) : (
                <Database size={16} style={{ color: 'var(--color-warning)' }} />
              )}
              <span style={{ 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: '600',
                color: alchemystStatus?.success ? 'var(--color-success)' : 'var(--color-warning)'
              }}>
                AlchemystAI {alchemystStatus?.success ? 'Connected' : 'Checking...'}
              </span>
            </div>
            <Link to="/leads/new" className="btn btn-primary">
              <Plus className="btn-icon" />
              Add Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Leads"
          value={overview.total || 0}
          icon={Users}
          change={5}
          color="var(--color-primary)"
          isLeadCard={true}
        />
        <StatCard
          title="New This Month"
          value={overview.newLeads || 0}
          icon={TrendingUp}
          change={12}
          color="var(--color-success)"
        />
        <StatCard
          title="Qualified"
          value={overview.qualifiedLeads || 0}
          icon={Target}
          change={8}
          color="var(--color-warning)"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${(overview.totalValue || 0).toLocaleString()}`}
          icon={DollarSign}
          change={15}
          color="var(--color-info)"
        />
      </div>

      {/* Recent Leads Card */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <h2 className="card-title" style={{ 
              fontSize: 'var(--font-size-xl)', 
              marginBottom: 'var(--space-1)' 
            }}>
              Recent Leads
            </h2>
            <p className="card-subtitle">
              Latest prospects in your pipeline • 
              <span style={{ 
                color: 'var(--color-primary)', 
                fontWeight: '600',
                marginLeft: 'var(--space-2)'
              }}>
                Live from AlchemystAI
              </span>
            </p>
          </div>
          <Link to="/leads" className="btn btn-outline">
            View All
            <ArrowRight size={16} style={{ marginLeft: 'var(--space-2)' }} />
          </Link>
        </div>

        {recentLeads && recentLeads.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Added</th>
                  <th>AI Ready</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id || lead._id}>
                    <td>
                      <div>
                        <div style={{ 
                          fontWeight: '600',
                          color: 'var(--color-gray-900)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim()}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-gray-500)'
                        }}>
                          {lead.email}
                        </div>
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
                        alignItems: 'center',
                        gap: 'var(--space-1)'
                      }}>
                        <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                        <span style={{ 
                          fontSize: 'var(--font-size-xs)', 
                          color: 'var(--color-success)',
                          fontWeight: '600'
                        }}>
                          Ready
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, var(--color-primary)10 0%, var(--color-info)10 100%)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)'
              }}>
                <Users size={32} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="empty-state-title">No leads yet</h3>
              <p style={{ 
                color: 'var(--color-gray-500)', 
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Start building your pipeline by adding your first lead.
              </p>
              <p style={{ 
                color: 'var(--color-gray-400)', 
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--font-size-sm)'
              }}>
                All leads will be stored in AlchemystAI for instant AI analysis
              </p>
              <Link to="/leads/new" className="btn btn-primary">
                <Plus className="btn-icon" />
                Add Your First Lead
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Lead Sources Card */}
      {stats?.sourceBreakdown && (
        <div className="card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="card-title" style={{ 
              fontSize: 'var(--font-size-xl)', 
              marginBottom: 'var(--space-1)' 
            }}>
              Lead Sources
            </h2>
            <p className="card-subtitle">Where your leads are coming from</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
              <div key={source} style={{ 
                background: 'var(--color-gray-50)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-gray-200)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: 'var(--font-size-2xl)', 
                  fontWeight: '700', 
                  color: 'var(--color-gray-900)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {typeof count === 'object' ? count.count || count._id || 0 : count}
                </div>
                <div style={{ 
                  color: 'var(--color-gray-600)', 
                  fontSize: 'var(--font-size-sm)', 
                  textTransform: 'capitalize',
                  fontWeight: '500'
                }}>
                  {source.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 