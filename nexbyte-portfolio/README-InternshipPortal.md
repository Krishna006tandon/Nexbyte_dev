# NexByte Internship Portal

A comprehensive internship management system built with React.js, Node.js, and MongoDB. This portal provides a seamless experience for students to apply for internships, track their progress, and receive certificates upon completion.

## 🚀 Features

### For Students
- **Browse Internships**: View available internship positions with detailed information
- **Smart Filtering**: Filter by category, mode (remote/onsite/hybrid), and search functionality
- **Easy Applications**: Submit applications with resume upload and cover letter
- **Student Dashboard**: Track application status, view assigned tasks, and monitor progress
- **Digital Certificates**: Receive verified certificates with unique IDs and QR codes

### For Administrators
- **Application Management**: Review, approve, or reject internship applications
- **Task Assignment**: Create and assign tasks to interns
- **Certificate Generation**: Generate professional certificates with verification
- **Analytics Dashboard**: Monitor application statistics and internship metrics
- **User Management**: Manage student accounts and permissions

## 📁 Project Structure

```
nexbyte-portfolio/
├── api/
│   ├── models/                    # MongoDB Schemas
│   │   ├── User.js               # User model (students, admins)
│   │   ├── InternshipListing.js   # Available internship positions
│   │   ├── InternshipApplication.js # Student applications
│   │   ├── Internship.js         # Active internships
│   │   ├── Certificate.js        # Generated certificates
│   │   └── Task.js              # Assigned tasks
│   ├── routes/                   # API Routes
│   │   ├── internshipListings.js # Internship listing CRUD
│   │   ├── applications.js       # Application management
│   │   └── certificates.js       # Certificate generation
│   ├── middleware/               # Express middleware
│   │   └── auth.js              # JWT authentication
│   └── server.js                # Main server file
├── src/
│   ├── components/               # React Components
│   │   ├── InternshipListingCard.js  # Individual internship card
│   │   ├── ApplicationForm.js        # Application submission form
│   │   ├── StudentDashboard.js       # Student dashboard
│   │   └── CertificateGenerator.js   # Certificate generation UI
│   ├── pages/                   # React Pages
│   │   └── InternshipPortal.js      # Main portal page
│   └── index.css               # Global styles with Tailwind CSS
├── uploads/                    # File uploads (resumes, etc.)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('student', 'admin'),
  phone: String,
  resume: String (file path),
  education: Array,
  skills: Array,
  internshipStatus: String,
  currentInternship: ObjectId
}
```

### InternshipListing Schema
```javascript
{
  title: String,
  description: String,
  company: String,
  location: String,
  mode: String ('remote', 'onsite', 'hybrid'),
  duration: String,
  stipend: String,
  skills: Array,
  requirements: Array,
  category: String,
  isActive: Boolean,
  applicationDeadline: Date,
  maxApplicants: Number,
  currentApplicants: Number,
  postedBy: ObjectId
}
```

### InternshipApplication Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  role: String,
  education: String,
  experience: String,
  skills: String,
  resume: String (file path),
  coverLetter: String,
  dateApplied: Date,
  status: String ('new', 'reviewing', 'approved', 'rejected'),
  notes: String,
  interviewDate: Date
}
```

### Certificate Schema
```javascript
{
  intern: ObjectId,
  internship: ObjectId,
  certificateId: String (unique),
  certificateUrl: String,
  issuedAt: Date,
  encryptedData: String
}
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nexbyte-portfolio
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nexbyte-internships

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (for notifications)
EMAIL_PASSWORD=your-gmail-app-password

# Certificate Encryption
CERT_SECRET=your-certificate-encryption-key
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed initial data (optional)
npm run seed
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm start

# Or start separately
# Frontend (port 3000)
npm start

# Backend (port 3001)
node api/server.js
```

## 🌐 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/profile` - Get user profile

### Internship Listings
- `GET /api/internships/listings` - Get all active internships
- `GET /api/internships/listings/:id` - Get single internship
- `POST /api/internships/listings` - Create internship (Admin)
- `PUT /api/internships/listings/:id` - Update internship (Admin)
- `DELETE /api/internships/listings/:id` - Delete internship (Admin)

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/user/:userId` - Get user applications
- `PUT /api/applications/:id` - Update application status (Admin)

### Certificates
- `POST /api/certificates/generate` - Generate certificate (Admin)
- `GET /api/certificates` - Get all certificates (Admin)
- `GET /api/certificates/user/:userId` - Get user certificates
- `GET /api/certificates/verify/:certificateId` - Verify certificate (Public)

## 🎨 Frontend-Backend Connection

### Authentication Flow
1. User logs in via `/api/login`
2. JWT token is stored in localStorage
3. Token is sent with each API request in Authorization header
4. Backend validates token and returns user data

### Application Process
1. Student browses internships via `/api/internships/listings`
2. Clicks "Apply Now" → Opens ApplicationForm component
3. Form data + resume uploaded to `/api/applications`
4. Admin reviews via dashboard and updates status
5. Student receives status updates in dashboard

### Certificate Generation
1. Admin selects completed internship
2. Calls `/api/certificates/generate` with intern and internship IDs
3. Backend generates unique certificate ID and encrypted data
4. Certificate displayed in CertificateGenerator component
5. QR code contains verification URL and certificate data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: Prevent brute force attacks
- **File Upload Validation**: Secure resume uploads
- **Data Encryption**: Certificate data encrypted at rest
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Express-validator for data sanitization

## 📱 Responsive Design

The portal is fully responsive using Tailwind CSS:
- **Desktop**: Full-featured dashboard and management panels
- **Tablet**: Optimized layout with collapsible navigation
- **Mobile**: Touch-friendly interface with simplified navigation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy build folder to hosting platform
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Configure MongoDB Atlas
# Deploy using Git or CLI
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: nexbyte.dev@gmail.com
- Website: https://nexbyte-dev.vercel.app/
- Documentation: Check the `/docs` folder

## 🔄 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Video interview integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] AI-powered resume screening
- [ ] Integration with LinkedIn and other job platforms

---

Built with ❤️ by the NexByte Team
