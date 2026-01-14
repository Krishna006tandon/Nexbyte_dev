const Internship = require('../models/Internship');
const User = require('../models/User');
const { autoGenerateCertificate } = require('./certificateGenerator');

// Check and complete internships automatically based on end date
const checkAndCompleteInternships = async () => {
  try {
    console.log('Checking for internships to auto-complete...');
    
    const now = new Date();
    
    // Find all internships that should be completed
    const internshipsToComplete = await Internship.find({
      status: 'in_progress',
      endDate: { $lte: now },
      certificate: { $exists: false }
    }).populate('intern');

    console.log(`Found ${internshipsToComplete.length} internships to auto-complete`);

    for (const internship of internshipsToComplete) {
      console.log(`Auto-completing internship for: ${internship.intern.name || internship.intern.email}`);
      
      // Update internship status
      internship.status = 'completed';
      await internship.save();
      
      // Auto-generate certificate
      const certificate = await autoGenerateCertificate(internship._id);
      
      if (certificate) {
        console.log(`✅ Certificate generated: ${certificate.certificateId}`);
        
        // Update user status
        await User.findByIdAndUpdate(internship.intern._id, {
          internshipStatus: 'completed'
        });
        
        console.log(`✅ User ${internship.intern.email} marked as completed`);
      } else {
        console.error(`❌ Failed to generate certificate for ${internship.intern.email}`);
      }
    }

  } catch (error) {
    console.error('Error in auto-completing internships:', error);
  }
};

// Check internships nearing completion (7 days before end date)
const checkInternshipsNearingCompletion = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const nearingCompletion = await Internship.find({
      status: 'in_progress',
      endDate: { 
        $gte: now,
        $lte: sevenDaysFromNow 
      }
    }).populate('intern');

    console.log(`Found ${nearingCompletion.length} internships nearing completion`);

    // Here you could send notifications to interns about upcoming completion
    for (const internship of nearingCompletion) {
      const daysLeft = Math.ceil((internship.endDate - now) / (1000 * 60 * 60 * 24));
      console.log(`Intern ${internship.intern.email} has ${daysLeft} days left`);
      
      // TODO: Send email/notification to intern about upcoming completion
    }

  } catch (error) {
    console.error('Error checking internships nearing completion:', error);
  }
};

// Run every hour to check for completions
const startAutoCompletionChecker = () => {
  console.log('🚀 Starting auto-completion checker...');
  
  // Check immediately on start
  checkAndCompleteInternships();
  checkInternshipsNearingCompletion();
  
  // Then check every hour
  setInterval(() => {
    checkAndCompleteInternships();
    checkInternshipsNearingCompletion();
  }, 60 * 60 * 1000); // 1 hour
  
  console.log('✅ Auto-completion checker started (runs every hour)');
};

module.exports = {
  checkAndCompleteInternships,
  checkInternshipsNearingCompletion,
  startAutoCompletionChecker
};
