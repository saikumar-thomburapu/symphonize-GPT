"""
Email service for sending password reset links.
OPTIMIZED for fast delivery.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails via Gmail SMTP - OPTIMIZED."""
    
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.SENDER_EMAIL
        self.sender_password = settings.SENDER_PASSWORD
        # ✅ Reuse SMTP connection for faster delivery
        self._smtp_connection = None
    
    def _get_connection(self):
        """Get or create SMTP connection (reuse for speed)."""
        try:
            if self._smtp_connection is None:
                self._smtp_connection = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
                self._smtp_connection.starttls()
                self._smtp_connection.login(self.sender_email, self.sender_password)
            return self._smtp_connection
        except Exception as e:
            logger.error(f"SMTP connection error: {str(e)}")
            self._smtp_connection = None
            raise
    
    async def send_password_reset_email(self, recipient_email: str, reset_link: str, user_name: str = "User"):
        """
        Send professional password reset email.
        OPTIMIZED for fast delivery (under 5 seconds).
        """
        try:
            logger.info(f"📧 Sending reset email to: {recipient_email}")
            
            subject = "Symphonize AI - Reset Your Password"
            
            # ✅ OPTIMIZED: Shorter HTML for faster sending
            html_body = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;padding:40px;">
<tr><td align="center" style="padding-bottom:30px;">
<h1 style="color:#3e78c2;margin:0;font-size:32px;">Symphonize AI</h1>
<p style="color:#999;margin:5px 0 0;font-size:14px;">Professional AI Chat Assistant</p>
</td></tr>
<tr><td style="padding:0 0 30px;"><hr style="border:none;border-top:1px solid #eee;margin:0;"></td></tr>
<tr><td style="padding-bottom:20px;">
<h2 style="color:#333;font-size:20px;margin:0 0 20px;">Password Reset Request</h2>
<p style="font-size:15px;color:#555;margin:0 0 10px;">Hi <strong>{user_name}</strong>,</p>
<p style="font-size:15px;color:#555;margin:0;">Click the button below to reset your password:</p>
</td></tr>
<tr><td align="center" style="padding:30px 0;">
<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#3e78c2;border-radius:6px;padding:0;">
<a href="{reset_link}" style="display:inline-block;padding:16px 50px;color:#fff;text-decoration:none;font-weight:bold;font-size:18px;border-radius:6px;">Reset Password</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:20px 0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;border-radius:5px;">
<tr><td><p style="margin:0;color:#856404;font-size:14px;"><strong>⏰ Expires in 1 hour</strong><br>Request a new one if expired.</p></td></tr>
</table>
</td></tr>
<tr><td style="padding:20px 0;">
<p style="color:#999;font-size:13px;margin:0;">Didn't request this? Ignore this email.</p>
</td></tr>
<tr><td style="padding:20px 0;"><hr style="border:none;border-top:1px solid #eee;"></td></tr>
<tr><td align="center">
<p style="color:#999;font-size:12px;margin:0;">© 2025 Symphonize AI</p>
</td></tr>
</table>
</td></tr></table>
</body></html>"""
            
            # Plain text version
            text_body = f"""Symphonize AI - Password Reset

Hi {user_name},

Reset your password: {reset_link}

⏰ Link expires in 1 hour.

© 2025 Symphonize AI"""
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = recipient_email
            #message["X-Priority"] = "1"  # High priority for faster delivery
            
            message.attach(MIMEText(text_body, "plain"))
            message.attach(MIMEText(html_body, "html"))
            
            # ✅ OPTIMIZED: Use connection pool for speed
            try:
                server = self._get_connection()
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            except Exception as smtp_error:
                # If connection failed, create new one
                logger.warning(f"Retrying with new connection...")
                self._smtp_connection = None
                with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(self.sender_email, self.sender_password)
                    server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            logger.info(f"✅ Email sent successfully to: {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Email failed: {str(e)}")
            raise Exception(f"Failed to send email: {str(e)}")

# Singleton instance
email_service = EmailService()














# """
# Email service for sending password reset links.
# """

# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import logging
# from ..core.config import settings

# logger = logging.getLogger(__name__)

# class EmailService:
#     """Service for sending emails via Gmail SMTP."""
    
#     def __init__(self):
#         self.smtp_server = "smtp.gmail.com"
#         self.smtp_port = 587
#         self.sender_email = settings.SENDER_EMAIL
#         self.sender_password = settings.SENDER_PASSWORD
    
#     async def send_password_reset_email(self, recipient_email: str, reset_link: str, user_name: str = "User"):
#         """
#         Send professional password reset email with VISIBLE button.
#         """
#         try:
#             subject = "Symphonize AI - Reset Your Password"
            
#             # SIMPLE HTML that WORKS in all email clients
#             html_body = f"""
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <meta charset="utf-8">
#             </head>
#             <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
#                 <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
#                     <tr>
#                         <td align="center">
#                             <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                
#                                 <!-- Header -->
#                                 <tr>
#                                     <td align="center" style="padding-bottom: 30px;">
#                                         <h1 style="color: #3e78c2; margin: 0; font-size: 32px;">Symphonize AI</h1>
#                                         <p style="color: #999999; margin: 5px 0 0 0; font-size: 14px;">Professional AI Chat Assistant</p>
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Divider -->
#                                 <tr>
#                                     <td style="padding: 0 0 30px 0;">
#                                         <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;">
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Content -->
#                                 <tr>
#                                     <td style="padding-bottom: 20px;">
#                                         <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px 0;">Password Reset Request</h2>
#                                         <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 10px 0;">Hi <strong>{user_name}</strong>,</p>
#                                         <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 0;">We received a request to reset your password for your Symphonize AI account. Click the button below to create a new password:</p>
#                                     </td>
#                                 </tr>
                                
#                                 <!-- RESET PASSWORD BUTTON - SOLID & VISIBLE -->
#                                 <tr>
#                                     <td align="center" style="padding: 30px 0;">
#                                         <table cellpadding="0" cellspacing="0" border="0">
#                                             <tr>
#                                                 <td align="center" style="background-color: #3e78c2; border-radius: 6px; padding: 0;">
#                                                     <a href="{reset_link}" target="_blank" style="display: inline-block; padding: 16px 50px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 6px;">Reset Password</a>
#                                                 </td>
#                                             </tr>
#                                         </table>
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Warning Box -->
#                                 <tr>
#                                     <td style="padding: 20px 0;">
#                                         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px;">
#                                             <tr>
#                                                 <td>
#                                                     <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
#                                                         <strong>⏰ This link expires in 1 hour</strong><br>
#                                                         For security reasons, this reset link is only valid for 1 hour. If it expires, you can request a new one from the login page.
#                                                     </p>
#                                                 </td>
#                                             </tr>
#                                         </table>
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Security Note -->
#                                 <tr>
#                                     <td style="padding: 20px 0;">
#                                         <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account will stay secure.</p>
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Divider -->
#                                 <tr>
#                                     <td style="padding: 20px 0;">
#                                         <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;">
#                                     </td>
#                                 </tr>
                                
#                                 <!-- Footer -->
#                                 <tr>
#                                     <td align="center">
#                                         <p style="color: #999999; font-size: 12px; line-height: 1.8; margin: 0;">
#                                             © 2025 Symphonize AI. All rights reserved.<br>
#                                             <a href="https://symphonize.com" style="color: #3e78c2; text-decoration: none;">symphonize.com</a>
#                                         </p>
#                                     </td>
#                                 </tr>
                                
#                             </table>
#                         </td>
#                     </tr>
#                 </table>
                
#                 <!-- Backup Link -->
#                 <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px 0;">
#                     <tr>
#                         <td align="center">
#                             <p style="font-size: 11px; color: #999999; margin: 0;">
#                                 Button not working? <a href="{reset_link}" style="color: #3e78c2;">Click here</a>
#                             </p>
#                         </td>
#                     </tr>
#                 </table>
#             </body>
#             </html>
#             """
            
#             # Plain text version
#             text_body = f"""
# Symphonize AI - Password Reset

# Hi {user_name},

# We received a request to reset your password.

# Click this link to reset your password:
# {reset_link}

# ⏰ This link expires in 1 hour.

# If you didn't request this, please ignore this email.

# © 2025 Symphonize AI
#             """
            
#             # Create message
#             message = MIMEMultipart("alternative")
#             message["Subject"] = subject
#             message["From"] = self.sender_email
#             message["To"] = recipient_email
            
#             # Attach both versions
#             message.attach(MIMEText(text_body, "plain"))
#             message.attach(MIMEText(html_body, "html"))
            
#             # Send via SMTP
#             with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
#                 server.starttls()
#                 server.login(self.sender_email, self.sender_password)
#                 server.sendmail(self.sender_email, recipient_email, message.as_string())
            
#             logger.info(f"✅ Password reset email sent to: {recipient_email}")
#             return True
            
#         except Exception as e:
#             logger.error(f"❌ Email sending failed: {str(e)}")
#             raise Exception(f"Failed to send email: {str(e)}")

# # Singleton instance
# email_service = EmailService()

