import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Sparkles, 
  Key, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Send,
  Loader,
  FileText,
  Star,
  TrendingUp,
  Clock,
  User,
  Building,
  Monitor,
  RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import alchemystIntegration from '../utils/alchemyst-api';

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [analysisType, setAnalysisType] = useState('general');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [includeLeadsContext, setIncludeLeadsContext] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [isLangChainSetup, setIsLangChainSetup] = useState(false);
  const [langchainStatus, setLangchainStatus] = useState(null);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ alchemyst: 'unknown', langchain: 'unknown' });

  // Load leads
  const { data: leadsData } = useQuery({
    queryKey: ['leads-for-insights'],
    queryFn: async () => {
      const response = await api.get('/leads?limit=50');
      return response.data;
    },
  });

  const leads = leadsData?.leads || [];

  useEffect(() => {
    checkLangChainStatus();
    checkAlchemystStatus();
  }, []);

  const checkAlchemystStatus = async () => {
    try {
      const result = await alchemystIntegration.testConnection();
      setConnectionStatus(prev => ({ 
        ...prev, 
        alchemyst: result.success ? 'connected' : 'error' 
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        alchemyst: 'error' 
      }));
    }
  };

  const checkLangChainStatus = async () => {
    try {
      const result = await alchemystIntegration.checkLangChainStatus();
      setLangchainStatus(result);
      setIsLangChainSetup(result.initialized);
      setConnectionStatus(prev => ({ 
        ...prev, 
        langchain: result.initialized ? 'connected' : 'setup-needed' 
      }));
    } catch (error) {
      console.error('Failed to check LangChain status:', error);
      setLangchainStatus({ success: false, error: error.message });
    }
  };

  const setupLangChain = async () => {
    if (!openaiApiKey.trim()) {
      alert('Please enter your OpenAI API key');
      return;
    }

    try {
      const result = await alchemystIntegration.setupLangChain(openaiApiKey);
      if (result.success) {
        setIsLangChainSetup(true);
        setShowApiKeySetup(false);
        alert('AI setup successful!');
        await checkLangChainStatus();
      }
    } catch (error) {
      alert(`Setup failed: ${error.message}`);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    
    try {
      const results = await alchemystIntegration.searchWithConverse(query, {
        userId: 'crm_search_user'
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ error: error.message, success: false });
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeLeads = async () => {
    if (selectedLeads.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      let result;
      if (selectedLeads.length === 1) {
        result = await alchemystIntegration.analyzeLeadWithAI(selectedLeads[0], analysisType);
      } else {
        result = await alchemystIntegration.analyzeBulkLeads(selectedLeads, analysisType);
      }
      setAnalysisResults(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      if (error.message.includes('LangChain not initialized')) {
        setAnalysisResults({ 
          success: false, 
          error: 'Please setup your OpenAI API key first to enable AI analysis.',
          needsSetup: true
        });
        setIsLangChainSetup(false);
      } else {
        setAnalysisResults({ success: false, error: error.message });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIChat = async () => {
    if (!isLangChainSetup) {
      alert('Please setup LangChain with your OpenAI API key first');
      return;
    }

    if (!chatMessage.trim()) return;

    setIsChatting(true);
    const userMessage = chatMessage;
    setChatMessage('');

    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const result = await alchemystIntegration.chatWithAI(userMessage, includeLeadsContext);
      
      if (result.success) {
        const aiMessage = {
          type: 'ai',
          message: result.data.response,
          timestamp: result.data.timestamp
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        let errorMsg = result.error || 'Unknown error occurred';
        
        // Handle specific AlchemystAI server issues
        if (errorMsg.includes('502 Bad Gateway') || errorMsg.includes('nginx')) {
          errorMsg = 'AlchemystAI servers are temporarily unavailable. Please try again in a few moments.';
        } else if (result.needsSetup) {
          errorMsg = 'Please setup your OpenAI API key first to enable AI chat.';
        }
        
        const errorMessage = {
          type: 'error',
          message: `AI Error: ${errorMsg}`,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      let errorMsg = error.message;
      
      // Handle common error scenarios
      if (errorMsg.includes('LangChain not initialized')) {
        errorMsg = 'Please setup your OpenAI API key first to enable AI chat.';
      } else if (errorMsg.includes('502') || errorMsg.includes('Bad Gateway')) {
        errorMsg = 'AI services are temporarily unavailable. Please try again later.';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Request timed out. Please try a shorter message or try again.';
      }
      
      const errorMessage = {
        type: 'error',
        message: `Chat failed: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Enhanced components for better data display
  const SearchResultCard = ({ result, index }) => {
    // Handle different result formats from AlchemystAI
    const isContextResult = result.score !== undefined;
    const content = isContextResult ? result.content : result;
    const metadata = isContextResult ? result.metadata : null;
    const score = isContextResult ? (result.score * 100).toFixed(1) : null;

    let leadData = null;
    try {
      leadData = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      leadData = { raw: content };
    }

    return (
      <div style={{
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Result #{index + 1}
            </span>
          </div>
          {score && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#10b981',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              flexShrink: 0
            }}>
              <Star size={10} />
              {score}%
            </div>
          )}
        </div>

        {leadData.fullName || leadData.firstName ? (
          // Lead data format - more compact
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <User size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <strong style={{ fontSize: '14px', lineHeight: '1.2' }}>
                  {leadData.fullName || `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim()}
                </strong>
              </div>
              {leadData.company && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Building size={10} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {leadData.company}
                  </span>
                </div>
              )}
              {leadData.email && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  📧 {leadData.email}
                </div>
              )}
              {leadData.phone && (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  📞 {leadData.phone}
                </div>
              )}
            </div>
            <div>
              {leadData.status && (
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ 
                    background: getStatusColor(leadData.status),
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {leadData.status}
                  </span>
                </div>
              )}
              {leadData.estimatedValue && (
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>
                  💰 ${leadData.estimatedValue.toLocaleString()}
                </div>
              )}
              {leadData.priority && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                  🎯 {leadData.priority}
                </div>
              )}
              {leadData.source && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  📍 {leadData.source}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Raw content format - more compact
          <div style={{ 
            fontSize: '12px', 
            color: '#374151',
            background: '#f9fafb',
            padding: '8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
          </div>
        )}

        {metadata && (
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid #e5e7eb',
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {metadata.fileName && <span>📄 {metadata.fileName}</span>}
              {metadata.lastModified && (
                <span>🕒 {new Date(metadata.lastModified).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const AnalysisResultCard = ({ result, index }) => {
    if (!result.success) {
      return (
        <div className="alert alert-error" style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong>Analysis Failed:</strong> {result.error}
        </div>
      );
    }

    const analysis = result.analysis || result.data?.analysis;
    const lead = leads.find(l => l.id === result.leadId);

    return (
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: 0, color: '#111827', fontSize: '14px', fontWeight: '600' }}>
              {lead ? `${lead.fullName} - ${lead.company}` : `Lead Analysis #${index + 1}`}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {result.type} analysis • {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <span style={{ 
            background: '#10b981', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '11px',
            fontWeight: '600'
          }}>
            ✅ Complete
          </span>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#374151',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {analysis}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#3b82f6',
      'qualified': '#8b5cf6',
      'proposal': '#f59e0b',
      'negotiation': '#f59e0b',
      'closed-won': '#10b981',
      'closed-lost': '#ef4444',
      'contacted': '#06b6d4'
    };
    return colors[status?.toLowerCase()] || '#6b7280';
  };

  const tabs = [
    { id: 'search', label: 'AI Search', icon: Search },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
      {/* Compact Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Brain size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: 0,
              color: '#111827'
            }}>
              AI Insights
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: '14px' 
            }}>
              {leads.length} leads • {chatHistory.length} chats • {searchResults?.data?.length || 0} results
            </p>
          </div>
        </div>

        {/* Status & Setup - More compact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isLangChainSetup ? (
              <CheckCircle size={14} style={{ color: '#10b981' }} />
            ) : (
              <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
            )}
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: isLangChainSetup ? '#10b981' : '#f59e0b'
            }}>
              {isLangChainSetup ? 'AI Ready' : 'Setup Required'}
            </span>
          </div>
          
          {!isLangChainSetup && (
            <button 
              onClick={() => setShowApiKeySetup(!showApiKeySetup)}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <Key size={12} style={{ marginRight: '4px' }} />
              Setup
            </button>
          )}
          
          <button 
            onClick={() => {
              checkLangChainStatus();
              checkAlchemystStatus();
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <RefreshCw size={12} style={{ marginRight: '4px' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* API Key Setup - More compact */}
      {showApiKeySetup && !isLangChainSetup && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center',
            padding: '16px'
          }}>
            <Settings size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="Enter OpenAI API Key (sk-proj-...)"
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
            </div>
            <button
              onClick={setupLangChain}
              disabled={!openaiApiKey.trim()}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation - More compact */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = !isLangChainSetup;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                borderBottom: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                color: isDisabled ? '#9ca3af' : 
                       isActive ? '#3b82f6' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {!isLangChainSetup ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Brain size={40} style={{ color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Connect OpenAI to Get Started
            </h3>
            <p style={{ 
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '24px',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              Set up your OpenAI API key to unlock intelligent search, analysis, and chat features.
            </p>
            <button 
              onClick={() => setShowApiKeySetup(true)}
              className="btn btn-primary"
              style={{ fontSize: '14px', padding: '10px 20px' }}
            >
              <Key size={14} style={{ marginRight: '8px' }} />
              Setup OpenAI
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* AI Search Tab */}
          {activeTab === 'search' && (
            <div className="card">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads with natural language (e.g., 'tech companies interested in software')"
                  className="form-input"
                  style={{ flex: 1, minWidth: '300px', fontSize: '14px' }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                >
                  {isSearching ? <Loader size={14} className="animate-spin" style={{ marginRight: '6px' }} /> : <Search size={14} style={{ marginRight: '6px' }} />}
                  Search
                </button>
              </div>
              
              {searchResults && (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  height: '500px',
                  overflowY: 'auto',
                  padding: '16px',
                  background: '#f9fafb'
                }}>
                  {searchResults.success ? (
                    searchResults.data?.length > 0 ? (
                      <div>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px',
                          paddingBottom: '12px',
                          borderBottom: '1px solid #e5e7eb',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <p style={{ 
                            fontSize: '14px', 
                            color: '#374151',
                            margin: 0,
                            fontWeight: '600'
                          }}>
                            🔍 Found {searchResults.data.length} matching results
                          </p>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            background: '#e5e7eb',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            "{searchQuery}"
                          </span>
                        </div>
                        {searchResults.data.map((result, index) => (
                          <SearchResultCard key={index} result={result} index={index} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <Search size={28} style={{ color: '#9ca3af', marginBottom: '12px' }} />
                        <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '14px' }}>No results found</p>
                        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                          Try different search terms or check if leads are synced to AlchemystAI
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="alert alert-error" style={{ fontSize: '14px' }}>
                      <strong>Search Error:</strong> {searchResults.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Chat Tab */}
          {activeTab === 'chat' && (
            <div className="card">
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                height: '500px',
                overflowY: 'auto',
                padding: '12px',
                marginBottom: '16px',
                background: '#f9fafb'
              }}>
                {chatHistory.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '24px'
                  }}>
                    <MessageSquare size={28} style={{ marginBottom: '12px' }} />
                    <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Start a conversation with AI about your leads</p>
                    <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
                      <p style={{ margin: '4px 0' }}>💡 Try asking:</p>
                      <p style={{ margin: '2px 0' }}>"What's the sales potential of my tech leads?"</p>
                      <p style={{ margin: '2px 0' }}>"Which leads should I prioritize this week?"</p>
                      <p style={{ margin: '2px 0' }}>"Show me patterns in my lead sources"</p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: msg.type === 'user' ? '#3b82f6' : 
                                 msg.type === 'ai' ? 'white' : '#fee2e2',
                      color: msg.type === 'user' ? 'white' : '#111827',
                      border: msg.type === 'ai' ? '1px solid #e5e7eb' : 'none',
                      boxShadow: msg.type === 'ai' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      maxWidth: msg.type === 'user' ? '80%' : '100%',
                      marginLeft: msg.type === 'user' ? 'auto' : '0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ fontSize: '13px' }}>
                          {msg.type === 'user' ? '👤 You' : msg.type === 'ai' ? '🤖 AI Assistant' : '❌ Error'}
                        </strong>
                        <span style={{ 
                          fontSize: '11px', 
                          opacity: 0.7 
                        }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '13px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={includeLeadsContext}
                    onChange={(e) => setIncludeLeadsContext(e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    📊 Include leads context in conversation ({leads.length} leads)
                  </span>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask AI about your leads..."
                  className="form-input"
                  style={{ flex: 1, fontSize: '14px' }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                />
                <button
                  onClick={handleAIChat}
                  disabled={isChatting || !chatMessage.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {isChatting ? <Loader size={14} className="animate-spin" style={{ marginRight: '6px' }} /> : <Send size={14} style={{ marginRight: '6px' }} />}
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="card">
              {/* Compact Analysis Controls */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px', minWidth: '180px' }}
                >
                  <option value="general">📊 General Analysis</option>
                  <option value="email">📧 Email Generation</option>
                  <option value="strategy">🎯 Sales Strategy</option>
                </select>
                
                <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                  {selectedLeads.length} of {leads.length} leads selected
                </div>
                
                <button
                  onClick={() => setSelectedLeads(leads.map(l => l.id))}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  Select All
                </button>
                
                <button
                  onClick={analyzeLeads}
                  disabled={isAnalyzing || selectedLeads.length === 0}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {isAnalyzing ? <Loader size={14} className="animate-spin" style={{ marginRight: '6px' }} /> : <BarChart3 size={14} style={{ marginRight: '6px' }} />}
                  Analyze
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '280px 1fr', 
                gap: '16px',
                height: '550px'
              }}>
                {/* Lead Selection - More compact */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Select Leads</h4>
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    height: 'calc(100% - 32px)',
                    overflowY: 'auto',
                    background: '#f9fafb'
                  }}>
                    {leads.map((lead) => (
                      <label key={lead.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: selectedLeads.includes(lead.id) ? '#dbeafe' : 'white',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', lineHeight: '1.2', marginBottom: '2px' }}>{lead.fullName}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lead.company}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Analysis Results */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>AI Analysis Results</h4>
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    height: 'calc(100% - 32px)',
                    overflowY: 'auto',
                    background: '#f9fafb',
                    padding: '12px'
                  }}>
                    {analysisResults ? (
                      analysisResults.success ? (
                        // Handle both single and bulk analysis results
                        analysisResults.results ? (
                          // Bulk analysis
                          <div>
                            <div style={{ 
                              background: 'white',
                              padding: '12px',
                              borderRadius: '6px',
                              marginBottom: '12px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <h5 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '14px' }}>
                                📈 Bulk Analysis Summary
                              </h5>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                <p style={{ margin: '2px 0' }}>✅ Successful: {analysisResults.successCount}</p>
                                <p style={{ margin: '2px 0' }}>❌ Failed: {analysisResults.errorCount}</p>
                                <p style={{ margin: '2px 0' }}>📊 Total: {analysisResults.totalProcessed}</p>
                              </div>
                            </div>
                            {analysisResults.results.map((result, index) => (
                              <AnalysisResultCard key={index} result={result} index={index} />
                            ))}
                          </div>
                        ) : (
                          // Single analysis
                          <AnalysisResultCard result={analysisResults} index={0} />
                        )
                      ) : (
                        <div className="alert alert-error" style={{ fontSize: '14px' }}>
                          <strong>Analysis Failed:</strong> {analysisResults.error}
                        </div>
                      )
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '24px'
                      }}>
                        <BarChart3 size={28} style={{ marginBottom: '12px' }} />
                        <p style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>Select leads and click Analyze to get AI insights</p>
                        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
                          <p style={{ margin: '2px 0' }}>🎯 Get personalized recommendations</p>
                          <p style={{ margin: '2px 0' }}>📧 Generate email templates</p>
                          <p style={{ margin: '2px 0' }}>📊 Analyze sales potential</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights; 