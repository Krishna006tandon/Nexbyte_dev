const nodemailer = require('nodemailer');

// Create a transporter using Gmail (you can configure this according to your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send client credentials email
const sendClientCredentials = async (clientEmail, clientName, clientPassword, projectName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nexbyte.com',
      to: clientEmail,
      subject: `🎉 Welcome to Nexbyte - Your Project "${projectName}" is Ready!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #4F46E5;">
                N
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Nexbyte!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your Digital Journey Starts Here 🚀</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                ✨ Project Activated Successfully
              </div>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; text-align: center;">Hello ${clientName}! 👋</h2>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #4F46E5; margin: 25px 0;">
              <p style="color: #475569; line-height: 1.7; margin: 0; font-size: 16px;">
                🎯 <strong>Great news!</strong> Your project <strong style="color: #4F46E5;">"${projectName}"</strong> has been successfully set up and is ready to go! We're thrilled to partner with you on this exciting journey.
              </p>
            </div>
            
            <!-- Credentials Section -->
            <div style="background: #ffffff; border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-flex; align-items: center; background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  🔐 Your Login Credentials
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>
                  <span style="color: #1f2937; font-weight: 600; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${clientEmail}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Password</span>
                  <span style="color: #1f2937; font-weight: 700; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 8px 16px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 1px;">${clientPassword}</span>
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0; font-style: italic;">
                💡 <strong>Tip:</strong> Save these credentials securely for future access
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
                        color: white; 
                        padding: 16px 40px; 
                        text-decoration: none; 
                        border-radius: 30px; 
                        display: inline-block;
                        font-weight: 700;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
                        transition: all 0.3s ease;
                        border: none;">
                🚀 Access Your Dashboard
              </a>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px; text-align: center;">
                Click here to start managing your project
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 20px; border-radius: 10px; border: 1px solid #fecaca; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">🔒</span>
                <h3 style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">Security First!</h3>
              </div>
              <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                For your account security, please change your password after your first login. This helps protect your project data and ensures only you have access to your dashboard.
              </p>
            </div>
            
            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; border: 1px solid #bae6fd; margin: 25px 0;">
              <h4 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px; text-align: center;">💬 Need Help? We're Here for You!</h4>
              <p style="color: #0c4a6e; line-height: 1.6; margin: 0; text-align: center; font-size: 14px;">
                Our dedicated support team is ready to assist you with any questions or concerns. Don't hesitate to reach out!
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="mailto:support@nexbyte.com" 
                   style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                  📧 Contact Support
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                <strong>Thank you for choosing Nexbyte!</strong><br>
                We're committed to making your project a huge success! 🎯
              </p>
              <div style="margin: 20px 0;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  Warm regards,<br>
                  <strong style="color: #4F46E5;">The Nexbyte Team</strong>
                </p>
              </div>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                <a href="https://nexbyte-dev.vercel.app/" style="color: #4F46E5; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🌐 www.nexbyte.com
                </a>
                <span style="color: #d1d5db; margin: 0 10px;">|</span>
                <a href="mailto:support@nexbyte.com" style="color: #4F46E5; text-decoration: none; font-weight: 600; font-size: 14px;">
                  ✉️ support@nexbyte.com
                </a>
              </div>
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

// Send password reset email
const sendPasswordReset = async (clientEmail, clientName, clientPassword) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nexbyte.com',
      to: clientEmail,
      subject: `🔐 Nexbyte - Your Password Has Been Reset Successfully`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 0;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #dc2626;">
                🔐
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your account credentials have been updated 🔒</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px;">
                ✅ Password Successfully Reset
              </div>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px; text-align: center;">Hello ${clientName}! 👋</h2>
            
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #dc2626; margin: 25px 0;">
              <p style="color: #991b1b; line-height: 1.7; margin: 0; font-size: 16px;">
                🔒 <strong>Security Update:</strong> Your password for your Nexbyte dashboard has been successfully reset. You can now use the new credentials below to access your account.
              </p>
            </div>
            
            <!-- New Credentials Section -->
            <div style="background: #ffffff; border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-flex; align-items: center; background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  🆕 Your New Login Credentials
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>
                  <span style="color: #1f2937; font-weight: 600; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${clientEmail}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">New Password</span>
                  <span style="color: #1f2937; font-weight: 700; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 8px 16px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 1px;">${clientPassword}</span>
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0; font-style: italic;">
                💡 <strong>Tip:</strong> Save these new credentials securely for future access
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
                        color: white; 
                        padding: 16px 40px; 
                        text-decoration: none; 
                        border-radius: 30px; 
                        display: inline-block;
                        font-weight: 700;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
                        transition: all 0.3s ease;
                        border: none;">
                🔐 Login with New Password
              </a>
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px; text-align: center;">
                Click here to access your dashboard with new credentials
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 20px; border-radius: 10px; border: 1px solid #fecaca; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">🚨</span>
                <h3 style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">Important Security Notice</h3>
              </div>
              <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5;">
                For your account security, please change this temporary password after your first login. This helps protect your project data and ensures only you have access to your dashboard.
              </p>
            </div>
            
            <!-- Fraud Alert -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; border: 1px solid #fbbf24; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                <h3 style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">Was This You?</h3>
              </div>
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                If you did not request this password reset, please contact our support team immediately at <a href="mailto:support@nexbyte.com" style="color: #dc2626; font-weight: 600;">support@nexbyte.com</a>. We take security seriously and will help secure your account.
              </p>
            </div>
            
            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; border: 1px solid #bae6fd; margin: 25px 0;">
              <h4 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px; text-align: center;">💬 Need Assistance?</h4>
              <p style="color: #0c4a6e; line-height: 1.6; margin: 0; text-align: center; font-size: 14px;">
                If you have any trouble logging in or other questions, our support team is here to help!
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="mailto:support@nexbyte.com" 
                   style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                  📧 Contact Support
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                <strong>Your security is our priority!</strong><br>
                Stay safe and keep your account secure 🔐
              </p>
              <div style="margin: 20px 0;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  Best regards,<br>
                  <strong style="color: #dc2626;">The Nexbyte Security Team</strong>
                </p>
              </div>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                <a href="https://nexbyte-dev.vercel.app/" style="color: #dc2626; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🌐 www.nexbyte.com
                </a>
                <span style="color: #d1d5db; margin: 0 10px;">|</span>
                <a href="mailto:support@nexbyte.com" style="color: #dc2626; text-decoration: none; font-weight: 600; font-size: 14px;">
                  ✉️ support@nexbyte.com
                </a>
              </div>
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

// Send password change notification email
const sendPasswordChangeNotification = async (clientEmail, clientName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nexbyte.com',
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
            
            <!-- Security Info Section -->
            <div style="background: #ffffff; border: 2px solid #e5e7eb; padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="display: inline-flex; align-items: center; background: #ecfdf5; color: #065f46; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  🛡️ Account Security Details
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>
                  <span style="color: #1f2937; font-weight: 600; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${clientEmail}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Status</span>
                  <span style="color: #065f46; font-weight: 700; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px;">Password Updated ✓</span>
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0; font-style: italic;">
                💡 <strong>Security Tip:</strong> Your new password is now active and secure
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
              <p style="color: #6b7280; font-size: 12px; margin-top: 10px; text-align: center;">
                Login with your new password
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; border: 1px solid #fbbf24; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 20px; margin-right: 10px;">ℹ️</span>
                <h3 style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">Was This You?</h3>
              </div>
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                If you did not change your password, please contact our support team immediately at <a href="mailto:support@nexbyte.com" style="color: #dc2626; font-weight: 600;">support@nexbyte.com</a>. We take security seriously and will help secure your account.
              </p>
            </div>
            
            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; border: 1px solid #bae6fd; margin: 25px 0;">
              <h4 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px; text-align: center;">💬 Need Help?</h4>
              <p style="color: #0c4a6e; line-height: 1.6; margin: 0; text-align: center; font-size: 14px;">
                If you have any questions about your account security or need assistance, our support team is here to help!
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="mailto:support@nexbyte.com" 
                   style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                  📧 Contact Support
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                <strong>Thank you for keeping your account secure!</strong><br>
                Your security is our top priority 🔐
              </p>
              <div style="margin: 20px 0;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  Best regards,<br>
                  <strong style="color: #059669;">The Nexbyte Security Team</strong>
                </p>
              </div>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                <a href="https://nexbyte-dev.vercel.app/" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🌐 www.nexbyte.com
                </a>
                <span style="color: #d1d5db; margin: 0 10px;">|</span>
                <a href="mailto:support@nexbyte.com" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 14px;">
                  ✉️ support@nexbyte.com
                </a>
              </div>
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

module.exports = {
  sendClientCredentials,
  sendPasswordReset,
  sendPasswordChangeNotification
};
