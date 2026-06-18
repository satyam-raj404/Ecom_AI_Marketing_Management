"""Email service — sends credentials via Gmail SMTP."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_credentials_email(
    *,
    to_email: str,
    display_name: str,
    temp_password: str,
    login_url: str,
    from_email: str,
    smtp_password: str,
) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your EcomBharat AI Access Credentials"
    msg["From"]    = f"EcomBharat AI <{from_email}>"
    msg["To"]      = to_email

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F4ECD9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4ECD9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0F3B2E;border-radius:16px 16px 0 0;padding:28px 32px 24px;">
            <div style="font-size:22px;font-weight:700;color:#F4B740;letter-spacing:-0.5px;">EcomBharat AI</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">Content Studio</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#0F3B2E;font-weight:700;">
              Welcome, {display_name}! 👋
            </h2>
            <p style="margin:0 0 24px;font-size:14px;color:#5C5449;line-height:1.6;">
              Your account has been created. Use the credentials below to log in.
            </p>

            <!-- Credentials box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#FDF8F0;border:1.5px solid #E5D9C2;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="margin-bottom:16px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1px;color:#E8703C;margin-bottom:4px;">Login URL</div>
                    <div style="font-size:14px;color:#0F3B2E;font-weight:500;">{login_url}</div>
                  </div>
                  <div style="border-top:1px solid #E5D9C2;padding-top:16px;margin-bottom:16px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1px;color:#E8703C;margin-bottom:4px;">Email</div>
                    <div style="font-size:14px;color:#0F3B2E;font-weight:500;">{to_email}</div>
                  </div>
                  <div style="border-top:1px solid #E5D9C2;padding-top:16px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;
                      letter-spacing:1px;color:#E8703C;margin-bottom:4px;">Temporary Password</div>
                    <div style="font-size:16px;color:#0F3B2E;font-weight:700;
                      font-family:'Courier New',monospace;letter-spacing:2px;
                      background:#fff;border:1px dashed #E5D9C2;border-radius:8px;
                      padding:8px 12px;display:inline-block;margin-top:2px;">{temp_password}</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#E8703C;border-radius:10px;">
                  <a href="{login_url}" style="display:inline-block;padding:13px 28px;
                    font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                    Log In Now →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Note -->
            <div style="background:#FDF8F0;border-left:3px solid #E8703C;
              border-radius:0 8px 8px 0;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#5C5449;line-height:1.6;">
                <strong>Security tip:</strong> Change your password after your first login
                via Settings. This temporary password should not be shared further.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0F3B2E;border-radius:0 0 16px 16px;
            padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
              EcomBharat AI · Content Studio · This is an automated message, do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
        server.login(from_email, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())
