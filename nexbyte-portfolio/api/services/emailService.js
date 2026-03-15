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
const sendClientCredentials = async (clientEmail, clientName, password, projectName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nexbyte.com',
      to: clientEmail,
      subject: `Welcome to Nexbyte - Your Project "${projectName}" Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nexbyte!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${clientName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for choosing Nexbyte for your project <strong>"${projectName}"</strong>. 
              We are excited to work with you and bring your vision to life!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 10px 0;"><strong>Password:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${password}</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;">
                Login to Your Dashboard
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Security Notice:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need assistance, please don't hesitate to contact us at 
              <a href="mailto:support@nexbyte.com" style="color: #667eea;">support@nexbyte.com</a>
            </p>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 14px;">
                Best regards,<br>
                <strong>The Nexbyte Team</strong>
              </p>
              <div style="margin-top: 10px;">
                <a href="https://nexbyte-dev.vercel.app/" style="color: #667eea; text-decoration: none;">www.nexbyte.com</a>
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
const sendPasswordReset = async (clientEmail, clientName, newPassword) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@nexbyte.com',
      to: clientEmail,
      subject: 'Nexbyte - Your Password Has Been Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${clientName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your password for your Nexbyte dashboard has been reset. You can now use the new credentials below to log in.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your New Login Credentials:</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${clientEmail}</p>
              <p style="margin: 10px 0;"><strong>New Password:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${newPassword}</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://nexbyte-dev.vercel.app/" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;">
                Login to Your Dashboard
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Security Notice:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you did not request this password reset, please contact us immediately at 
              <a href="mailto:support@nexbyte.com" style="color: #667eea;">support@nexbyte.com</a>
            </p>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 14px;">
                Best regards,<br>
                <strong>The Nexbyte Team</strong>
              </p>
              <div style="margin-top: 10px;">
                <a href="https://nexbyte-dev.vercel.app/" style="color: #667eea; text-decoration: none;">www.nexbyte.com</a>
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

module.exports = {
  sendClientCredentials,
  sendPasswordReset
};
