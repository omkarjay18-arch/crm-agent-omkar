CRM Integration System
A modern, full-stack Customer Relationship Management (CRM) system built with Node.js, MongoDB, and React. This system allows you to efficiently manage leads and contacts with a clean, intuitive interface. 

✨ Features
Lead Management
✅ Complete Lead Lifecycle: Track leads from initial contact to conversion
✅ Advanced Search & Filtering: Find leads by name, company, status, or source
✅ Lead Sources Tracking: Monitor where your leads come from
✅ Priority Management: Set and track lead priorities
✅ Sales Pipeline: Track estimated values and probabilities
✅ Follow-up Scheduling: Set next follow-up dates
✅ Bulk Import: Import multiple leads at once
Contact Management
✅ Customer Database: Manage existing customers and prospects
✅ Company Information: Track job titles, departments, and company details
✅ Contact Types: Categorize as customers, prospects, vendors, or partners
✅ Account Management: Assign account managers to contacts
Dashboard & Analytics
✅ Real-time Statistics: View lead counts, pipeline value, and conversion rates
✅ Source Analytics: See which channels generate the most leads
✅ Recent Activity: Quick overview of new leads and updates
✅ Performance Metrics: Track your CRM performance
Technical Features
✅ Modern UI: Clean, responsive design with smooth interactions
✅ Real-time Updates: Live data updates across the application
✅ Data Validation: Comprehensive input validation and error handling
✅ Search & Pagination: Efficient data browsing for large datasets
✅ API Documentation: RESTful API with proper error responses
🛠️ Tech Stack
Backend:Node.js with Express.js
MongoDB with Mongoose ODM
Joi for data validation
CORS, Helmet for security
Rate limiting for API protection
Frontend:React 18 with modern hooks
React Router for navigation
React Query for state management
React Hook Form for form handling
Lucide React for icons
Custom CSS with modern design  
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)
MongoDB (local installation or cloud instance)
Git
Installation  
Clone the repository
git clone <your-repo-url>
cd CRM
Install dependencies
# Install root dependencies and all sub-dependencies
npm run install:all
Set up environment variables
# Copy the example environment file
cp server/.env.example server/.# Edit the .env file with your MongoDB connection string
# Default: MONGODB_URI=mongodb://localhost:27017/crm_database
Start MongoDB
If using local MongoDB: mongod
If using MongoDB Atlas: Ensure your connection string is in .env
Run the application
# Development mode (runs both client and server)
npm run dev
Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
Health check: http://localhost:5000/api/health
📁 Project Structure 
CRM/
├── package.json                 # Root package.json with scripts
├── README.md                   # This file
├── server/                     # Backend Node.js application
│   ├── package.json           # Server dependencies
│   ├── index.js               # Main server file
│   ├── models/                # MongoDB models
│   │   ├── Lead.js           # Lead model
│   │   └── Contact.js        # Contact model
│   ├── routes/               # API routes
│   │   ├── leads.js          # Lead endpoints
│   │   ├── contacts.js       # Contact endpoints
│   │   └── pipeline.js       # Pipeline analytics
│   └── .env.example          # Environment variables template
└── client/                   # Frontend React application
    ├── package.json          # Client dependencies
    ├── public/
    │   └── index.html        # Main HTML file
    └── src/
        ├── App.js            # Main App component
        ├── App.css           # Global styles
        ├── index.js          # React entry point
        ├── components/       # Reusable components
        │   └── Layout.js     # Main layout with sidebar
        ├── pages/            # Page components
        │   ├── Dashboard.js  # Dashboard with statistics
        │   ├── Leads.js      # Lead listing page
        │   ├── LeadForm.js   # Lead create/edit form
        │   ├── Contacts.js   # Contact listing page
        │   └── ContactForm.js # Contact create/edit form
        └── utils/
            └── api.js        # Axios API configuration 
            🔗 API Endpoints
Leads API
GET /api/leads - Get all leads (with pagination, search, filtering)
GET /api/leads/:id - Get specific lead
POST /api/leads - Create new lead
PUT /api/leads/:id - Update lead
DELETE /api/leads/:id - Delete lead (soft delete)
POST /api/leads/bulk - Bulk import leads
GET /api/leads/stats/summary - Get lead statistics
Contacts API
GET /api/contacts - Get all contacts
GET /api/contacts/:id - Get specific contact
POST /api/contacts - Create new contact
PUT /api/contacts/:id - Update contact
DELETE /api/contacts/:id - Delete contact
Pipeline API
GET /api/pipeline - Get pipeline overview
Health Check
GET /api/health - Server health status  
💡 Usage Examples
Adding a Lead via API
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "company": "Acme Corp",
    "source": "website",
    "status": "new",
    "estimatedValue": 5000
  }'
Searching Leads
curl "http://localhost:5000/api/leads?search=acme&status=new&page=1&limit=10"
🔧 Configuration
Environment Variables (server/.env)
PORT=5000                                          # Server port
MONGODB_URI=mongodb://localhost:27017/crm_database # MongoDB connection
NODE_ENV=development                               # Environment
Available Scripts
# Root level commands
npm run dev           # Start both client and server in development
npm run install:all   # Install all dependencies
npm run start         # Start server in production

# Server commands
npm run server:dev    # Start server with nodemon
npm run server:start  # Start server in production

# Client commands
npm run client:dev    # Start React development server
npm run client:build  # Build React for production 
🎨 UI Features
Modern Design: Clean, professional interface with consistent styling
Responsive Layout: Works perfectly on desktop, tablet, and mobile
Dark Sidebar: Professional navigation with active state indicators
Status Badges: Color-coded status and priority indicators
Form Validation: Real-time validation with helpful error messages
Loading States: Smooth loading indicators and skeleton screens
Toast Notifications: User-friendly success and error messages
Empty States: Helpful guidance when no data is available
🔒 Security Features
Rate Limiting: Prevents API abuse
Input Validation: Server-side validation with Joi
Helmet: Security headers for Express
CORS: Configured cross-origin resource sharing
Data Sanitization: Protection against injection attacks
🚀 Deployment
Production Build
Build the React application:

cd client && npm run build
Start the server:

cd server && npm start
Environment Setup
Set NODE_ENV=production in your environment
Use a production MongoDB instance
Configure proper CORS origins
Set up environment variables on your hosting platform
🤝 Contributing
Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Commit your changes: git commit -m 'Add amazing feature'
Push to the branch: git push origin feature/amazing-feature
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
If you encounter any issues or have questions:

Check the Issues page
Create a new issue with detailed information
Include error messages and steps to reproduce
🎯 Future Enhancements
 User authentication and authorization
 Email integration for lead communication
 Advanced reporting and analytics
 Task and activity management
 Integration with external services (email marketing, etc.)
 Mobile app development
 Advanced pipeline management with drag-and-drop
 Custom fields and lead scoring
Built with ❤️ for modern CRM needs
