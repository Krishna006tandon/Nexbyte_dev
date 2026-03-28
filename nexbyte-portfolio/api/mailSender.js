const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail (configure this according to your email service)
const createTransporter = () => {
    // Check for required environment variables
    const emailUser = process.env.EMAIL_USER || "nexbyte.dev@gmail.com";
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (!emailPass) {
        console.warn('WARNING: Email password (EMAIL_PASSWORD or EMAIL_PASS) is not set.');
    }

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        debug: false,
        logger: false
    });
};

// Send client credentials email
const sendClientCredentials = async (clientEmail, details) => {
    try {
        const { clientName, contactPerson, password, projectName, phone, companyAddress, projectType, projectDeadline, totalBudget } = details;
        const transporter = createTransporter();
        const emailUser = process.env.EMAIL_USER || "nexbyte.dev@gmail.com";

        const mailOptions = {
            from: `"NexByte" <${emailUser}>`,
            to: clientEmail,
            subject: `🎉 Welcome to Nexbyte - Your Project "${projectName}" is Ready!`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 1;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Welcome to Nexbyte!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your Digital Journey Starts Here 🚀</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; text-align: center;">Hello ${contactPerson || clientName}! 👋</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
              We are excited to work with you on <strong>${projectName}</strong>! Below are your project details and login credentials for your dedicated dashboard.
            </p>

            <!-- Project Info -->
            <div style="margin: 30px 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #f3f4f6; padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">
                <h3 style="margin: 0; font-size: 16px; color: #374151;">📋 Project Overview</h3>
              </div>
              <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; width: 40%;">Project Name:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${projectName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Project Type:</td>
                    <td style="padding: 8px 0; color: #111827;">${projectType || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Deadline:</td>
                    <td style="padding: 8px 0; color: #111827;">${projectDeadline || 'TBD'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Total Budget:</td>
                    <td style="padding: 8px 0; color: #111827;">${totalBudget ? (typeof totalBudget === 'number' ? '₹' + totalBudget.toLocaleString('en-IN') : totalBudget) : 'N/A'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Credentials Section -->
            <div style="background: #f8fafc; border: 2px solid #4F46E5; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e40af;">🔐 Your Login Credentials</h3>
              <div style="margin-bottom: 10px;">
                <span style="color: #64748b; font-size: 14px; text-transform: uppercase;">Email</span><br>
                <div style="font-size: 16px; font-weight: 600; color: #111827;">${clientEmail}</div>
              </div>
              <div>
                <span style="color: #64748b; font-size: 14px; text-transform: uppercase;">Password</span><br>
                <div style="font-size: 20px; font-weight: 700; color: #4F46E5; letter-spacing: 1px;">${password}</div>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 15px; font-style: italic;">
                Please change your password after your first login for better security.
              </p>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);">
                🚀 Access Your Dashboard
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 13px;">Warm regards,<br><strong style="color: #4F46E5;">The Nexbyte Team</strong></p>
            </div>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};


// Send password change notification email (Specific to User request)
const sendPasswordChangeNotification = async (clientEmail, clientName) => {
    try {
        const transporter = createTransporter();
        const emailUser = process.env.EMAIL_USER || "nexbyte.dev@gmail.com";

        const mailOptions = {
            from: `"NexByte Security" <${emailUser}>`,
            to: clientEmail,
            subject: `🔐 Nexbyte - Your Password Has Been Changed Successfully`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #059669;">
                ✓
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Password Changed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your account security has been updated 🔒</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                ✅ Security Update Completed
              </div>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; text-align: center;">Hello ${clientName}! 👋</h2>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #059669; margin: 25px 0;">
              <p style="color: #065f46; line-height: 1.7; margin: 0; font-size: 16px;">
                🔐 <strong>Security Confirmation:</strong> Your password for your Nexbyte dashboard has been successfully changed. This action helps keep your account secure.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                        color: white; 
                        padding: 16px 40px; 
                        text-decoration: none; 
                        border-radius: 30px; 
                        display: inline-block;
                        font-weight: 700;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
                        transition: all 0.3s ease;
                        border: none;">
                🚀 Continue to Dashboard
              </a>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; border: 1px solid #fbbf24; margin: 25px 0;">
              <h3 style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">Was This You?</h3>
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                If you did not change your password, please contact our support team immediately at support@nexbyte.com.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                Best regards,<br>
                <strong style="color: #059669;">The Nexbyte Security Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password change notification email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password change notification email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
const sendPasswordReset = async (clientEmail, clientName, clientPassword) => {
    try {
        const transporter = createTransporter();
        const emailUser = process.env.EMAIL_USER || "nexbyte.dev@gmail.com";

        const mailOptions = {
            from: `"NexByte Security" <${emailUser}>`,
            to: clientEmail,
            subject: `🔐 Nexbyte - Your Password Has Been Reset Successfully`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat;"></div>
            <div style="position: relative; z-index: 1;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your account credentials have been updated 🔒</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; text-align: center;">Hello ${clientName}! 👋</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px;">Email Address</span>
                  <span style="color: #1f2937; font-weight: 600;">${clientEmail}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px;">New Password</span>
                  <span style="color: #1f2937; font-weight: 700; background: #dc2626; color: white; padding: 4px 10px; border-radius: 4px;">${clientPassword}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 700;">
                🔐 Login with New Password
              </a>
            </div>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};


// Send user credentials email (for Admin, Intern, Member)
const sendUserCredentials = async (userEmail, details) => {
    try {
        const { role, password, internshipStartDate, internshipEndDate, acceptanceDate, offerLetterContent } = details;
        const transporter = createTransporter();
        const emailUser = process.env.EMAIL_USER || "nexbyte.dev@gmail.com";
        
        let subject = '';
        let title = '';
        let welcomeMessage = '';
        let extraInfo = '';
        let themeColor = '#4F46E5'; // Default indigo

        if (role === 'admin') {
            subject = '🛡️ Welcome to NexByte - Admin Account Created';
            title = 'Admin Account Created';
            welcomeMessage = 'Your administrator account has been successfully set up with full system access.';
            themeColor = '#4F46E5';
            extraInfo = `
                <div style="margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #991b1b;">Admin Privileges:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px;">
                        <li>Manage clients and projects</li>
                        <li>User & Role management</li>
                        <li>Billing and Invoicing</li>
                        <li>System-wide reports</li>
                    </ul>
                </div>
            `;
        } else if (role === 'intern') {
            subject = '🎓 Welcome to NexByte - Internship Account Created';
            title = 'Internship Account Created';
            welcomeMessage = 'Congratulations! Your intern account has been created. We are excited to have you join our team.';
            themeColor = '#10B981'; // Green
            
            const startDate = internshipStartDate ? new Date(internshipStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
            const endDate = internshipEndDate ? new Date(internshipEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
            const acceptBy = acceptanceDate ? new Date(acceptanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';

            extraInfo = `
                <div style="margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #065f46;">Internship Details:</h4>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr><td style="padding: 4px 0; color: #064e3b;">Start Date:</td><td style="padding: 4px 0; font-weight: 600;">${startDate}</td></tr>
                        <tr><td style="padding: 4px 0; color: #064e3b;">End Date:</td><td style="padding: 4px 0; font-weight: 600;">${endDate}</td></tr>
                        <tr><td style="padding: 4px 0; color: #064e3b;">Accept Offer By:</td><td style="padding: 4px 0; font-weight: 600; color: #b91c1c;">${acceptBy}</td></tr>
                    </table>
                    ${offerLetterContent ? '<p style="margin: 10px 0 0; font-size: 13px; color: #047857;">📄 Your offer letter is available in your dashboard.</p>' : ''}
                </div>
            `;
        } else {
            subject = '👋 Welcome to NexByte - Account Created';
            title = 'Account Created';
            welcomeMessage = 'Your account has been successfully created. Welcome to the NexByte community!';
            themeColor = '#6366F1';
        }

        const mailOptions = {
            from: `"NexByte" <${emailUser}>`,
            to: userEmail,
            subject: subject,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <!-- Header -->
            <div style="background-color: ${themeColor}; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to NexByte</h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px;">
              <h2 style="color: #111827; margin-top: 0;">${title}</h2>
              <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">${welcomeMessage}</p>
              
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</h3>
                <div style="margin-bottom: 12px;">
                  <span style="color: #374151; font-weight: 600;">Email:</span>
                  <span style="color: #111827; margin-left: 8px;">${userEmail}</span>
                </div>
                <div>
                  <span style="color: #374151; font-weight: 600;">Password:</span>
                  <code style="background-color: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #d1d5db; margin-left: 8px; font-weight: bold; color: ${themeColor};">${password}</code>
                </div>
              </div>
              
              ${extraInfo}
              
              <div style="text-align: center; margin-top: 35px;">
                <a href="https://nexbyte-dev.vercel.app/" style="background-color: ${themeColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Login to your Dashboard
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                For security reasons, please change your password after logging in.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Warm regards,<br>The NexByte Team</p>
            </div>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending user credentials email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendClientCredentials,
    sendPasswordChangeNotification,
    sendPasswordReset,
    sendUserCredentials
};
