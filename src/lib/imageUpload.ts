import { supabase } from './supabase';

const BUCKET_NAME = 'pc-portables-images';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload une image vers le bucket Supabase Storage
 * @param file - Fichier image à uploader
 * @param filename - Nom du fichier (optionnel, généré automatiquement si absent)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImage(file: File, filename?: string): Promise<UploadResult> {
  try {
    // Générer un nom de fichier unique si non fourni
    const fileExt = file.name.split('.').pop();
    const fileName = filename || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur upload:', error);
      return { success: false, error: error.message };
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Erreur upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

/**
 * Upload une image depuis base64 (pour les photos de caméra)
 * @param base64Data - Données base64 de l'image
 * @param filename - Nom du fichier (optionnel)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImageFromBase64(base64Data: string, filename?: string): Promise<UploadResult> {
  try {
    // Convertir base64 en blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Créer un objet File depuis le blob
    const fileExt = base64Data.includes('data:image/png') ? 'png' : 'jpg';
    const fileName = filename || `camera-${Date.now()}.${fileExt}`;
    const file = new File([blob], fileName, { type: blob.type });
    
    // Upload avec la fonction standard
    return await uploadImage(file, fileName);
  } catch (error) {
    console.error('Erreur conversion base64:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur conversion base64' 
    };
  }
}

/**
 * Supprimer une image du bucket
 * @param url - URL publique de l'image à supprimer
 * @returns Promise<boolean> - true si suppression réussie
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Erreur suppression:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression:', error);
    return false;
  }
}

/**
 * Obtenir l'URL publique d'une image
 * @param path - Chemin du fichier dans le bucket
 * @returns URL publique
 */
export function getImageUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return publicUrl;
} 