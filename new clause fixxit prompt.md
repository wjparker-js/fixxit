Fixxit Backend API System - Comprehensive Development Prompt
System Architecture Overview
You are tasked with building a production-ready, enterprise-grade backend API for the Fixxit SaaS platform - a sophisticated hazard reporting and work order management system. This system must handle multi-tenant architecture, real-time communications, file management, and complex workflow orchestration.

Core Technical Requirements
Technology Stack
Backend Framework: Node.js with Express.js
Database: MySQL with Sequelize ORM
Real-time Communication: Socket.io for WebSocket connections
Caching: Redis for session management and performance optimization
File Storage: Multer with cloud storage integration (AWS S3/local filesystem)
Authentication: JWT with bcrypt for password hashing
API Documentation: Swagger/OpenAPI 3.0
Testing: Jest for unit testing, Supertest for API testing
Process Management: PM2 for production deployment
Security: Helmet.js, CORS, rate limiting with express-rate-limit
Database Architecture
Core Tables Structure
sql
-- Users table with role-based access
users (
  id, email, password_hash, first_name, last_name, phone,
  user_type ENUM('public', 'employee', 'admin'),
  employee_data JSON, -- For employee-specific information
  created_at, updated_at, is_active, email_verified
)

-- Multi-tenant organizations
tenants (
  id, organization_name, domain, contact_info,
  branding_config JSON, subscription_tier,
  api_limits JSON, created_at, is_active
)

-- User-tenant relationships for multi-tenancy
user_tenants (
  id, user_id, tenant_id, role, permissions JSON,
  created_at, is_active
)

-- Hazard reports with comprehensive data
reports (
  id, reporter_id, tenant_id, title, description,
  location_description, latitude, longitude,
  severity_level, category, status,
  metadata JSON, created_at, updated_at
)

-- File attachments for reports and work orders
attachments (
  id, parent_type ENUM('report', 'workorder', 'remediation'),
  parent_id, file_path, file_type, file_size,
  upload_by, created_at
)

-- Work order management
work_orders (
  id, report_id, tenant_id, assigned_to, created_by,
  title, description, priority, status,
  scheduled_date, estimated_completion,
  metadata JSON, created_at, updated_at
)

-- Remediation documentation
remediations (
  id, work_order_id, performed_by, completion_date,
  description, before_photos JSON, after_photos JSON,
  materials_used JSON, time_spent, created_at
)

-- Real-time notifications
notifications (
  id, user_id, tenant_id, type, title, message,
  data JSON, read_at, created_at, expires_at
)

-- System audit trail
audit_logs (
  id, user_id, tenant_id, action, resource_type,
  resource_id, old_values JSON, new_values JSON,
  ip_address, user_agent, created_at
)
Comprehensive API Endpoint Specifications
Authentication & User Management
javascript
// Enhanced user management with role-based access
POST   /api/v1/auth/register          // Public registration + employee onboarding
POST   /api/v1/auth/login             // Multi-factor authentication support
POST   /api/v1/auth/refresh           // JWT token refresh
POST   /api/v1/auth/logout            // Secure session termination
POST   /api/v1/auth/forgot-password   // Password reset workflow
POST   /api/v1/auth/verify-email      // Email verification process

GET    /api/v1/users/profile          // Get current user profile
PUT    /api/v1/users/profile          // Update profile with validation
DELETE /api/v1/users/profile          // Account deactivation (soft delete)
GET    /api/v1/users/tenants          // List user's accessible tenants
POST   /api/v1/users/switch-tenant    // Switch active tenant context
Report Management (Anonymous + Authenticated)
javascript
POST   /api/v1/reports                // Submit report (anonymous/authenticated)
GET    /api/v1/reports                // List reports with advanced filtering
GET    /api/v1/reports/:id            // Get detailed report information
PUT    /api/v1/reports/:id            // Update report (owner/admin only)
DELETE /api/v1/reports/:id            // Soft delete report
GET    /api/v1/reports/nearby         // Location-based report discovery
POST   /api/v1/reports/:id/follow     // Subscribe to report updates
POST   /api/v1/reports/bulk           // Bulk report submission for integrations
Work Order Management
javascript
POST   /api/v1/workorders             // Create work order from report
GET    /api/v1/workorders             // List with kanban-style filtering
GET    /api/v1/workorders/:id         // Detailed work order view
PUT    /api/v1/workorders/:id         // Update work order details
PUT    /api/v1/workorders/:id/assign  // Assign to team member
PUT    /api/v1/workorders/:id/accept  // Accept work order assignment
PUT    /api/v1/workorders/:id/reject  // Reject with reason
PUT    /api/v1/workorders/:id/schedule // Schedule remediation
PUT    /api/v1/workorders/:id/complete // Mark as completed
GET    /api/v1/workorders/analytics   // Performance metrics and insights
Remediation Documentation
javascript
POST   /api/v1/remediations           // Document remediation work
GET    /api/v1/remediations/:workorderId // View remediation details
PUT    /api/v1/remediations/:id       // Update remediation documentation
POST   /api/v1/remediations/:id/photos // Upload before/after photos
GET    /api/v1/remediations/reports   // Generate remediation reports
Real-time Features & Notifications
javascript
GET    /api/v1/notifications          // List user notifications
PUT    /api/v1/notifications/:id/read // Mark notification as read
PUT    /api/v1/notifications/read-all // Bulk mark as read
POST   /api/v1/notifications/subscribe // WebSocket subscription management
DELETE /api/v1/notifications/:id      // Delete notification

// WebSocket Events
'report:created'     // New report submitted
'workorder:assigned' // Work order assigned to user
'workorder:updated'  // Status change updates
'remediation:completed' // Work completion notification
Administrative Functions
javascript
GET    /api/v1/admin/dashboard        // Real-time dashboard data
GET    /api/v1/admin/reports          // All reports for tenant
GET    /api/v1/admin/workorders       // Work order management interface
POST   /api/v1/admin/workorders/bulk-assign // Bulk assignment operations
GET    /api/v1/admin/analytics        // Comprehensive analytics
GET    /api/v1/admin/users            // User management for tenant
PUT    /api/v1/admin/users/:id/role   // Update user roles/permissions
GET    /api/v1/admin/audit-log        // Security audit trail
File Management
javascript
POST   /api/v1/files/upload           // Secure file upload with validation
GET    /api/v1/files/:id              // Serve files with access control
DELETE /api/v1/files/:id              // Remove file attachment
POST   /api/v1/files/bulk-upload      // Multiple file upload
GET    /api/v1/files/thumbnail/:id    // Generate/serve image thumbnails
System Operations
javascript
POST   /api/v1/system/backup          // Initiate system backup
GET    /api/v1/system/backup/status   // Backup operation status
GET    /api/v1/system/health          // System health check
GET    /api/v1/system/metrics         // Performance metrics
POST   /api/v1/system/cache/clear     // Clear application cache
Real-time Architecture Recommendation
WebSocket Implementation with Socket.io
javascript
// Recommended real-time architecture using Socket.io
// Benefits: Mature, battle-tested, excellent documentation, broad browser support

// Server-side implementation structure:
const io = require('socket.io')(server, {
  cors: { origin: process.env.FRONTEND_URL },
  adapter: require('socket.io-redis')({ 
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT 
  })
});

// Namespace-based organization for multi-tenancy
const adminNamespace = io.of('/admin');
const userNamespace = io.of('/user');

// Room-based isolation for tenant data
socket.join(`tenant_${tenantId}_admin`);
socket.join(`user_${userId}_notifications`);
Alternative Real-time Solutions (Evaluated)
Server-Sent Events (SSE): Simpler but uni-directional, good for notifications only
WebRTC Data Channels: Overkill for this use case, better for peer-to-peer
Long Polling: Fallback option, higher server resource usage
GraphQL Subscriptions: Good if already using GraphQL, adds complexity
Recommendation: Socket.io with Redis adapter for horizontal scaling

Security & Infrastructure Architecture
Security Implementation
javascript
// Multi-layered security approach
- JWT tokens with refresh mechanism and blacklisting
- Rate limiting per endpoint and per user
- Input validation using Joi/express-validator
- SQL injection prevention through parameterized queries
- XSS protection with helmet.js
- CSRF protection for state-changing operations
- File upload security with type validation and scanning
- API versioning for backward compatibility
- Comprehensive audit logging
Backup & Disaster Recovery
javascript
// Automated backup strategy
- Database: Automated MySQL dumps with point-in-time recovery
- Files: Incremental backup to cloud storage (AWS S3/Azure Blob)
- Code: Git repository with automated CI/CD pipeline
- Configuration: Infrastructure as Code (Docker/Kubernetes)
- Monitoring: Health checks, error tracking, performance monitoring
Load Balancing & Scaling
javascript
// Production deployment architecture
- Nginx reverse proxy for load balancing
- PM2 cluster mode for Node.js process management
- Redis cluster for session storage and caching
- MySQL read replicas for query optimization
- CDN integration for static file delivery
- Horizontal pod autoscaling in Kubernetes environment
Development Task Breakdown
Phase 1: Foundation & Core Infrastructure (Weeks 1-3)
Task 1.1: Project Setup & Configuration
 Initialize Node.js project with proper package.json
 Set up ESLint, Prettier, and Git hooks for code quality
 Configure environment management (.env files, config validation)
 Set up testing framework (Jest) with coverage reporting
 Create Docker containerization setup
 Implement CI/CD pipeline basics
Task 1.2: Database Design & Implementation
 Design complete database schema with relationships
 Create Sequelize models with proper associations
 Implement database migrations and seeders
 Set up database connection with connection pooling
 Create database backup/restore procedures
 Implement soft delete functionality across models
Task 1.3: Core Express.js Application Structure
 Set up Express.js application with middleware stack
 Implement security middleware (helmet, cors, rate limiting)
 Create error handling and logging infrastructure
 Set up API versioning structure
 Implement request validation middleware
 Create comprehensive API documentation with Swagger
Phase 2: Authentication & User Management (Weeks 4-5)
Task 2.1: Authentication System
 Implement JWT authentication with refresh tokens
 Create password hashing and validation
 Build email verification system
 Implement password reset workflow
 Add multi-factor authentication support
 Create session management with Redis
Task 2.2: User Management API
 Build user registration endpoints (public/employee)
 Implement user profile management
 Create role-based access control (RBAC)
 Build multi-tenant user switching
 Implement user deactivation/reactivation
 Add user activity tracking
Phase 3: Report Management System (Weeks 6-7)
Task 3.1: Report Submission & Storage
 Create report submission API (anonymous/authenticated)
 Implement file upload handling with validation
 Build image processing and thumbnail generation
 Create location data validation and storage
 Implement report categorization and tagging
 Add duplicate report detection
Task 3.2: Report Management Features
 Build report listing with advanced filtering
 Implement report search functionality
 Create report update and deletion endpoints
 Add report following/subscription features
 Implement location-based report discovery
 Create report analytics and metrics
Phase 4: Work Order System (Weeks 8-9)
Task 4.1: Work Order Creation & Management
 Build work order creation from reports
 Implement work order assignment system
 Create work order status management
 Build scheduling and calendar integration
 Implement work order acceptance/rejection workflow
 Add work order reassignment capabilities
Task 4.2: Workflow Orchestration
 Create automated work order routing
 Implement escalation procedures
 Build team collaboration features
 Create work order templates and standardization
 Add bulk operations for work order management
 Implement work order analytics and reporting
Phase 5: Real-time Features (Weeks 10-11)
Task 5.1: WebSocket Implementation
 Set up Socket.io with multi-tenant namespace support
 Implement real-time notification delivery
 Create room-based communication for teams
 Build real-time dashboard updates
 Add connection management and reconnection logic
 Implement WebSocket authentication and authorization
Task 5.2: Notification System
 Build comprehensive notification management
 Implement multiple notification channels (in-app, email, SMS)
 Create notification preferences and subscriptions
 Add notification scheduling and batching
 Implement push notification support
 Create notification analytics and metrics
Phase 6: Administrative Features (Weeks 12-13)
Task 6.1: Admin Dashboard Backend
 Create real-time dashboard data aggregation
 Implement administrative report management
 Build user management for administrators
 Create tenant configuration management
 Add system monitoring and health checks
 Implement audit trail and logging
Task 6.2: Analytics & Reporting
 Build comprehensive analytics engine
 Create custom report generation
 Implement data export functionality
 Add performance metrics and KPI tracking
 Create automated reporting schedules
 Build compliance reporting features
Phase 7: Integration & Advanced Features (Weeks 14-15)
Task 7.1: Third-party Integrations
 Implement email service integration (SendGrid/AWS SES)
 Add cloud storage integration (AWS S3/Azure)
 Create calendar integration (Google Calendar/Outlook)
 Build SMS notification service integration
 Add mapping service integration
 Implement external API webhook support
Task 7.2: Advanced Features
 Create bulk import/export functionality
 Implement advanced search with Elasticsearch
 Add AI/ML integration endpoints
 Create mobile app API optimizations
 Build offline synchronization support
 Implement advanced caching strategies
Phase 8: Security & Production Readiness (Weeks 16-17)
Task 8.1: Security Hardening
 Conduct comprehensive security audit
 Implement advanced input validation
 Add SQL injection prevention measures
 Create comprehensive access logging
 Implement API security best practices
 Add vulnerability scanning and monitoring
Task 8.2: Performance Optimization
 Optimize database queries and indexing
 Implement advanced caching strategies
 Add database connection optimization
 Create API response optimization
 Implement file serving optimization
 Add performance monitoring and alerting
Phase 9: Testing & Quality Assurance (Weeks 18-19)
Task 9.1: Comprehensive Testing
 Create unit tests for all business logic
 Implement integration tests for API endpoints
 Add end-to-end testing scenarios
 Create load testing and performance benchmarks
 Implement security testing procedures
 Add automated testing in CI/CD pipeline
Task 9.2: Documentation & Training
 Complete API documentation with examples
 Create system architecture documentation
 Build deployment and operations guides
 Create user management documentation
 Add troubleshooting and FAQ sections
 Create video tutorials and training materials
Phase 10: Deployment & Monitoring (Week 20)
Task 10.1: Production Deployment
 Set up production server environment
 Configure load balancing and reverse proxy
 Implement SSL/TLS certificates
 Create automated deployment pipeline
 Set up monitoring and alerting systems
 Configure backup and disaster recovery
Task 10.2: Go-Live Support
 Perform final pre-launch testing
 Create go-live checklist and procedures
 Set up 24/7 monitoring and support
 Implement incident response procedures
 Create user onboarding and support materials
 Establish maintenance and update procedures
Code Quality Standards
Documentation Requirements
javascript
/**
 * Report Management Service
 * Handles creation, validation, and processing of hazard reports
 * Supports both anonymous and authenticated submissions
 * 
 * @author Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Creates a new hazard report with file attachments
 * Validates input data, processes images, and stores report
 * Triggers notification workflows for administrators
 * 
 * @param {Object} reportData - Report submission data
 * @param {string} reportData.title - Report title (required)
 * @param {string} reportData.description - Detailed description
 * @param {Array} reportData.images - Image file uploads (max 3)
 * @param {Object} reportData.location - Location information
 * @param {string} reportData.location.description - Location description
 * @param {number} reportData.location.latitude - GPS latitude
 * @param {number} reportData.location.longitude - GPS longitude
 * @param {Object} userContext - User authentication context
 * @returns {Promise<Object>} Created report object with ID
 * @throws {ValidationError} When input data is invalid
 * @throws {StorageError} When file upload fails
 */
async function createReport(reportData, userContext) {
  // Implementation with comprehensive error handling
}
Error Handling Standards
javascript
// Centralized error handling with proper HTTP status codes
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

// Comprehensive error middleware
const errorHandler = (error, req, res, next) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      timestamp: error.timestamp
    }
  });
};
This comprehensive prompt provides a complete roadmap for building a production-ready Fixxit backend API system with enterprise-grade features, security, and scalability considerations.

