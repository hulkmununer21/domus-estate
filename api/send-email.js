import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const emailResponse = await resend.emails.send({
      from: 'Domus Servitia <noreply@domusservitia.co.uk>',
      to,
      subject,
      html: `<div style="font-family:sans-serif;font-size:16px">${message}</div>`,
    });

    if (emailResponse.error) {
      return res.status(500).json({ error: emailResponse.error });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}