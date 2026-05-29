import api from './api';

// AlchemystAI Integration through Backend API
export const alchemystIntegration = {
  // Send lead to Context Processor
  async sendToContextProcessor(lead) {
    try {
      const response = await api.post('/alchemyst/context/add', { lead });
      return response.data;
    } catch (error) {
      console.error('Failed to send lead to Context Processor:', error);
      throw error;
    }
  },

  // Batch send multiple leads
  async sendBatchToContextProcessor(leads) {
    try {
      const response = await api.post('/alchemyst/sync/bulk', { leads });
      return response.data;
    } catch (error) {
      console.error('Failed to send batch leads to Context Processor:', error);
      throw error;
    }
  },

  // Individual sync with progress tracking (using bulk API)
  async syncLeadsIndividually() {
    try {
      // Get all leads first
      const leadsResponse = await api.get('/leads?limit=1000');
      const leads = leadsResponse.data.leads;
      
      if (!leads || leads.length === 0) {
        return {
          success: true,
          message: 'No leads to sync',
          results: { total: 0, synced: 0, failed: 0 }
        };
      }
      
      // Use bulk sync for individual processing
      const response = await api.post('/alchemyst/sync/bulk', { leads });
      return response.data;
    } catch (error) {
      console.error('Failed to sync leads individually:', error);
      throw error;
    }
  },

  // Search using Context Search
  async searchWithConverse(query, options = {}) {
    try {
      const response = await api.post('/alchemyst/context/search', { 
        query, 
        userId: options.userId || 'crm_user'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search with Context API:', error);
      throw error;
    }
  },

  // Get AI insights for a lead using chat
  async getLeadInsights(lead) {
    try {
      const message = `Analyze this lead and provide insights: ${lead.firstName} ${lead.lastName} from ${lead.company}. Status: ${lead.status}, Priority: ${lead.priority}, Estimated Value: $${lead.estimatedValue}`;
      const response = await api.post('/alchemyst/chat', { 
        message,
        userId: `crm_user_${lead._id}`
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get lead insights:', error);
      throw error;
    }
  },

  // Delete context data
  async deleteContext(contextId, userId = 'crm_user') {
    try {
      const response = await api.post('/alchemyst/context/delete', { 
        contextId, 
        userId 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete context:', error);
      throw error;
    }
  },

  // Augment lead data with AI insights
  async augmentLeadData(leads, userId = 'crm_user') {
    try {
      // Convert single lead to array if needed
      const leadsArray = Array.isArray(leads) ? leads : [leads];
      
      const response = await api.post('/alchemyst/leads/augment', { 
        leads: leadsArray,
        userId 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to augment lead data:', error);
      throw error;
    }
  },

  // Test API connectivity
  async testConnection() {
    try {
      const response = await api.get('/alchemyst/status');
      console.log('✅ AlchemystAI API connection successful');
      return response.data;
    } catch (error) {
      console.error('❌ AlchemystAI API connection failed:', error);
      throw error;
    }
  },

  // LangChain Integration Functions

  // Setup LangChain with OpenAI API key
  async setupLangChain(openaiApiKey) {
    try {
      const response = await api.post('/alchemyst/langchain/setup', { openaiApiKey });
      console.log('✅ LangChain setup successful');
      return response.data;
    } catch (error) {
      console.error('❌ LangChain setup failed:', error);
      throw error;
    }
  },

  // Check LangChain status
  async checkLangChainStatus() {
    try {
      const response = await api.get('/alchemyst/langchain/status');
      return response.data;
    } catch (error) {
      console.error('❌ LangChain status check failed:', error);
      throw error;
    }
  },

  // Analyze a single lead with AI
  async analyzeLeadWithAI(leadId, analysisType = 'general') {
    try {
      const response = await api.post('/alchemyst/langchain/analyze-lead', { 
        leadId, 
        analysisType 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lead AI analysis failed:', error);
      
      // Handle specific setup requirement error
      if (error.response?.data?.needsSetup) {
        throw new Error('LangChain not initialized. Please setup your OpenAI API key first.');
      }
      
      throw error;
    }
  },

  // Analyze multiple leads with AI
  async analyzeBulkLeads(leadIds, analysisType = 'general') {
    try {
      const response = await api.post('/alchemyst/langchain/analyze-bulk', { 
        leadIds, 
        analysisType 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Bulk AI analysis failed:', error);
      
      // Handle specific setup requirement error
      if (error.response?.data?.needsSetup) {
        throw new Error('LangChain not initialized. Please setup your OpenAI API key first.');
      }
      
      throw error;
    }
  },

  // Chat with AI about CRM data
  async chatWithAI(message, includeLeadsContext = true) {
    try {
      const response = await api.post('/alchemyst/langchain/chat', { 
        message, 
        includeLeadsContext 
      });
      return response.data;
    } catch (error) {
      console.error('❌ AI chat failed:', error);
      throw error;
    }
  }
};

export default alchemystIntegration; 