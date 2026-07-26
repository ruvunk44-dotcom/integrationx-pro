// Email service — pluggable. Currently logs to console. To enable real emails,
// set SENDGRID_API_KEY (or RESEND_API_KEY) and swap in the provider call.
export async function sendEmail({ to, subject, html, text }) {
  const key = process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY
  if (!key) {
    console.log('\n============= [MOCK EMAIL] =============')
    console.log('TO:', to)
    console.log('SUBJECT:', subject)
    console.log('BODY:', text || html?.slice(0, 400))
    console.log('========================================\n')
    return { sent: false, reason: 'no_provider_key' }
  }
  // TODO: implement SendGrid / Resend call when key is provided by user.
  return { sent: true }
}

export const passwordResetEmail = ({ name, link }) => ({
  subject: 'Reset your IntegrationX Pro password',
  html: `<div style="font-family:system-ui;color:#111"><h2>Hi ${name || 'there'} 👋</h2><p>We received a request to reset your password. Click the link below to set a new one — valid for the next 60 minutes.</p><p><a href="${link}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#7c3aed,#db2777);color:white;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a></p><p style="color:#666;font-size:12px">If you didn't request this, safely ignore this email. — IntegrationX Pro team</p></div>`,
  text: `Reset your IntegrationX Pro password: ${link} (valid for 60 minutes)`,
})
