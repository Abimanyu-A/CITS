import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env"});

let transporter = null;

// Create transporter only once
const initializeTransporter = () => {
  console.log(process.env.SMTP_PASS)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials are missing. Please check your .env file.");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: "gmail", // If using a custom provider, configure host and port
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    // Verify transporter connection
    transporter.verify((error) => {
      if (error) {
        console.error("SMTP Transporter Verification Failed:", error);
      } else {
        console.log("SMTP Transporter is ready to send emails");
      }
    });
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
  }
};

// Ensure transporter is initialized
initializeTransporter();

export const sendEmail = async (to, subject, text, html = null) => {
  if (!to || !subject) {
    console.error("Email sending failed: Missing 'to' or 'subject'");
    return false;
  }

  if (!transporter) {
    console.error("Email transporter is not available");
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html: html || text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return false;
  }
};

export const sendWelcomeEmail = async (email, username, tempPassword) => {
  if (!email || !username || !tempPassword) {
    console.error("Cannot send welcome email: Missing required information");
    return false;
  }

  const subject = "Welcome to the Company!";
  const text = `Hi ${username},

Your account has been created successfully. 
Your login username is ${username} 
Your temporary password is ${tempPassword}

Please reset your password after logging in.

Best regards,
Company Team`;

  const html = `
  <html>
    <body>
      <h2>Welcome to the Company!</h2>
      <p>Hi ${username},</p>
      <p>Your account has been created successfully.</p>
      <ul>
        <li>Username: <strong>${username}</strong></li>
        <li>Temporary Password: <strong>${tempPassword}</strong></li>
      </ul>
      <p>Please reset your password after logging in.</p>
      <p>Best regards,<br>Company Team</p>
    </body>
  </html>
  `;

  return await sendEmail(email, subject, text, html);
};

