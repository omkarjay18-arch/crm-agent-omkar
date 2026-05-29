# CRM System with AlchemystAI Integration

A modern, full-stack Customer Relationship Management (CRM) system built with React and Node.js, featuring comprehensive integration with the AlchemystAI Platform.

## 🚀 Features

### Core CRM Functionality
- **Lead Management**: Create, edit, delete, and track sales leads
- **Contact Management**: Manage customer contacts and relationships
- **Dashboard Analytics**: Real-time statistics and insights
- **Search & Filtering**: Advanced search capabilities across leads and contacts
- **Responsive Design**: Modern, mobile-friendly interface

### 🧠 AlchemystAI Platform Integration

#### 1. Data Layer Integration
- **Automatic Lead Sync**: New leads are automatically sent to AlchemystAI Context Processor
- **Bulk Data Sync**: Sync all existing leads with batch processing
- **Real-time Updates**: Lead changes are synchronized with AlchemystAI platform
- **Progress Tracking**: Visual progress indicators for sync operations

#### 2. Context Processor API
- **Lead Intelligence**: Enhanced lead data with AI-generated insights
- **Lead Scoring**: Automatic calculation of lead conversion probability
- **Risk Assessment**: AI-powered risk analysis for sales opportunities
- **Next Best Actions**: Intelligent recommendations for sales activities

#### 3. Converse Enterprise Search
- **Semantic Search**: Natural language queries across CRM data
- **Lead Discovery**: Find relevant leads using conversational queries
- **Knowledge Integration**: Search across integrated data sources
- **Context-Aware Results**: Intelligent search results with business context

#### 4. AI Insights & Analytics
- **Conversion Probability**: AI-powered lead scoring and conversion predictions
- **Sales Recommendations**: Intelligent next steps for each lead
- **Performance Analytics**: AI-driven insights into sales performance
- **Predictive Analytics**: Forecast sales outcomes and identify trends

## 🏗️ Architecture

```
CRM Frontend (React + Vite)
├── Lead Management Pages
├── AI Insights Dashboard
├── Data Sync Interface
└── Enterprise Search

API Integration Layer
├── AlchemystAI API Client
├── Context Processor Integration
├── Converse Search Integration
└── Data Transformation Layer

CRM Backend (Node.js + Express)
├── Lead/Contact APIs
├── MongoDB Database
└── Business Logic Layer
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Fast development server and build tool
- **React Router**: Client-side routing
- **React Query**: Server state management
- **React Hook Form**: Form handling and validation
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **MongoDB**: Document database
- **Mongoose**: MongoDB object modeling
- **Joi**: Data validation
- **CORS**: Cross-origin resource sharing

### Integration
- **AlchemystAI Platform**: AI-powered insights and search
- **Bearer Token Authentication**: Secure API access
- **REST API Integration**: Standard HTTP-based communication

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB instance
- AlchemystAI Platform access credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd crm-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../crm-vite
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create server/.env
   echo "PORT=3001" > server/.env
   echo "MONGODB_URI=mongodb://localhost:27017/crm" >> server/.env
   ```

4. **Update AlchemystAI credentials**
   Edit `crm-vite/src/utils/alchemyst-api.js` and update:
   ```javascript
   const BEARER_TOKEN = 'your-bearer-token-here';
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm start

   # Terminal 2: Start frontend development server
   cd crm-vite
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📋 AlchemystAI Integration Guide

### API Configuration

The AlchemystAI integration is configured in `crm-vite/src/utils/alchemyst-api.js`:

```javascript
const ALCHEMYST_API_BASE = 'https://platform-backend.getalchemystai.com/api/v1';
const BEARER_TOKEN = 'your-bearer-token';
```

### Key Integration Points

#### 1. Automatic Lead Sync
When a new lead is created, it's automatically sent to AlchemystAI:
```javascript
// In LeadForm.jsx
await alchemystIntegration.sendToContextProcessor(result.lead);
```

#### 2. Bulk Data Sync
Sync all leads using the Data Sync page:
```javascript
await alchemystIntegration.sendBatchToContextProcessor(allLeads);
```

#### 3. Enterprise Search
Search leads using natural language:
```javascript
const results = await alchemystIntegration.searchWithConverse(query, options);
```

#### 4. AI Insights
Get AI-powered insights for leads:
```javascript
const insights = await alchemystIntegration.getLeadInsights(lead);
```

### Data Transformation

Leads are transformed to AlchemystAI format with additional intelligence:
- **Lead Scoring**: Calculated based on value, status, and priority
- **Engagement Level**: Determined from lead interaction history
- **Sales Stage Mapping**: Status mapped to sales pipeline stages

## 🎯 Usage Examples

### Creating a Lead with AI Integration
1. Navigate to "Add Lead" page
2. Fill in lead information
3. Submit form - lead is automatically:
   - Saved to CRM database
   - Sent to AlchemystAI Context Processor
   - Enriched with AI insights

### Bulk Data Synchronization
1. Go to "Data Sync" page
2. Click "Batch Sync All Leads"
3. Monitor progress in real-time
4. View sync results and any errors

### AI-Powered Search
1. Visit "AI Insights" page
2. Use Enterprise Search to ask questions like:
   - "Show me high-value leads from this quarter"
   - "Find leads with high conversion probability"
   - "Which leads need immediate attention?"

### Getting Lead Insights
1. Go to "AI Insights" page
2. Select a lead from the list
3. View AI-generated insights including:
   - Conversion probability
   - Risk assessment
   - Recommended next actions

## 📊 API Endpoints

### CRM API Endpoints
- `GET /api/leads` - List leads with filtering and pagination
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/stats` - Get lead statistics

### AlchemystAI Integration Endpoints
- `POST /context-processor` - Send lead to Context Processor
- `POST /context-processor/batch` - Bulk send leads
- `POST /converse/search` - Enterprise search
- `POST /insights/lead` - Get AI insights for lead
- `GET /health` - API health check

## 🔧 Configuration Options

### Lead Scoring Algorithm
Customize lead scoring in `alchemyst-api.js`:
```javascript
const calculateLeadScore = (lead) => {
  // Customize scoring logic based on your business rules
  let score = 0;
  if (lead.estimatedValue > 50000) score += 30;
  // Add more scoring criteria
  return Math.min(score, 100);
};
```

### Search Filters
Configure search filters for Enterprise Search:
```javascript
const searchOptions = {
  filters: {
    type: 'lead_data',
    source: 'crm_integration',
    date_range: 'last_30_days'
  },
  limit: 20
};
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd crm-vite
npm run build
# Deploy 'dist' folder to your hosting provider
```

### Backend Deployment
```bash
cd server
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
npm start
```

## 🧪 Testing the Integration

### Test AlchemystAI Connection
1. Go to "AI Insights" page
2. Click "Test Connection" button
3. Verify successful connection

### Verify Lead Sync
1. Create a test lead
2. Check browser console for sync logs
3. Verify lead appears in AlchemystAI platform

### Test Enterprise Search
1. Go to "AI Insights" page
2. Try different search queries
3. Verify relevant results are returned

## 📝 Assignment Completion Status

✅ **CRM/Social Integration with Leads**: Fully implemented
✅ **Integration with Company's Data Layer**: AlchemystAI Context Processor integration
✅ **Context Processor API Integration**: Real-time lead sync and batch processing
✅ **Converse Integration with Enterprise Search**: Natural language search capability
✅ **Demo Video**: Ready for recording
⭐ **MCP Server (Bonus)**: Not implemented - bonus feature

## 🔍 Demo Video Script

1. **Introduction**: Show CRM dashboard and overview
2. **Lead Creation**: Create a new lead, show automatic AlchemystAI sync
3. **Data Integration**: Demonstrate bulk sync functionality
4. **Enterprise Search**: Show conversational search capabilities
5. **AI Insights**: Display AI-powered lead analysis and recommendations
6. **Real-time Integration**: Show how updates sync automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the AlchemystAI integration
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For integration issues or questions:
1. Check the browser console for detailed error logs
2. Verify AlchemystAI API credentials
3. Test network connectivity to AlchemystAI platform
4. Review API documentation at: https://platform-backend.getalchemystai.com/api/v1/docs/

---

**Built with ❤️ for the AlchemystAI integration assignment**
