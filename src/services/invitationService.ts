import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { getCurrentAuthUser } from './auth';

function generateInvitationToken(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function createInvitation(
  familyId: string,
  emailInvited: string,
  roleProposed: string,
): Promise<{ invitationId: string; token: string }> {
  const user = getCurrentAuthUser();
  
  const existingInvitation = await checkExistingInvitation(familyId, emailInvited);
  if (existingInvitation) {
    throw new Error('Cette personne a déjà été invitée ou est déjà membre');
  }

  const token = generateInvitationToken();
  
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 2);

  const invitationData = {
    familyId,
    senderId: user.uid,
    emailInvited: emailInvited.toLowerCase().trim(),
    tokenInvitation: token,
    roleProposed,
    status: 'pending',
    createdAt: Timestamp.now(),
    expiredAt: Timestamp.fromDate(expirationDate),
  };

  const docRef = await addDoc(collection(db, 'invitations'), invitationData);
  
  
  return { 
    invitationId: docRef.id, 
    token: token, 
  };
}


async function checkExistingInvitation(familyId: string, email: string): Promise<boolean> {
  const q = query(
    collection(db, 'invitations'),
    where('familyId', '==', familyId),
    where('emailInvited', '==', email.toLowerCase().trim()),
    where('status', '==', 'pending'),
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export function generateInvitationLink(invitationId: string, token: string): string {

  const baseUrl = 'https://votre-app.com'; 
  return `${baseUrl}/accept-invitation?id=${invitationId}&token=${token}`;
}