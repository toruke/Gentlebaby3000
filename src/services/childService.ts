import { 
  collection, 
  doc, 
  serverTimestamp, 
  writeBatch, 
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { CreateChildRequest } from '../models/child';

/**
 * Ajoute un enfant à une famille existante
 * Utilise un Batch pour garantir la cohérence des données
 */
export async function addChildToFamily(familyId: string, childData: CreateChildRequest) {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');
  if (!familyId) throw new Error('ID de famille manquant');

  const batch = writeBatch(db);

  // 1. 👶 Référence pour le nouveau document Enfant (dans la sous-collection)
  // Chemin : family/{familyId}/children/{childId}
  const childRef = doc(collection(db, 'family', familyId, 'children'));

  // 2. 🏠 Référence du document Famille (pour mettre à jour le tableau résumé)
  const familyRef = doc(db, 'family', familyId);

  // Préparation des données de l'enfant
  const newChild = {
    id: childRef.id,
    familyId: familyId,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    ...childData, // firstName, lastName, gender, birthday
    photoUrl: null, // On gérera l'upload plus tard si besoin
  };

  // Préparation du résumé pour le document parent (Family)
  // Cela permet d'afficher la liste des enfants sans charger toute la sous-collection
  const childSummary = {
    id: childRef.id,
    firstName: childData.firstName,
    lastName: childData.lastName,
    birthDate: childData.birthday, // Important pour le calcul d'âge rapide
  };

  // 🚀 Ajout des opérations au batch
  
  // A. Création du document complet dans la sous-collection
  batch.set(childRef, newChild);

  // B. Mise à jour du tableau 'babies' dans le document parent
  batch.update(familyRef, {
    babies: arrayUnion(childSummary),
  });

  // Exécution atomique
  await batch.commit();

  return childRef.id;
}