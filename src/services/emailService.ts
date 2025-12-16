import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  recipientEmail: string,
  senderName: string,
  familyName: string,
  invitationLink: string,
): Promise<void> {
  try {
    await resend.emails.send({
      from: 'noreply@votre-domaine.com',
      to: recipientEmail,
      subject: `${senderName} vous invite à rejoindre ${familyName} sur GentleBaby`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>👶 Invitation à GentleBaby</h2>
          <p>Bonjour,</p>
          <p><strong>${senderName}</strong> vous invite à rejoindre la famille <strong>${familyName}</strong> sur GentleBaby.</p>
          <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation :</p>
          <a href="${invitationLink}" 
             style="display: inline-block; background-color: #007bff; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Accepter l'invitation
          </a>
          <p style="color: #666; font-size: 14px;">
            ⏰ Ce lien expire dans 2 heures.
          </p>
          <p style="color: #999; font-size: 12px;">
            Si vous n'avez pas demandé cette invitation, ignorez cet email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error('Impossible d\'envoyer l\'email d\'invitation');
  }
}