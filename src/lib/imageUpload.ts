import { supabase } from './supabase';

// Configuration des buckets par type de produit
const BUCKET_NAMES = {
  'pc-portable': 'pc-portables-images',
  'moniteur': 'moniteurs-images',
  'peripherique': 'peripheriques-images',
  'chaise-gaming': 'chaises-gaming-images',
  'composant-pc': 'composants-pc-images',
  'pc-gamer': 'pc-gamer-images'
} as const;

type ProductType = keyof typeof BUCKET_NAMES;

// Bucket par défaut (pour compatibilité)
const DEFAULT_BUCKET_NAME = 'pc-portables-images';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload une image vers le bucket Supabase Storage spécifique au type de produit
 * @param file - Fichier image à uploader
 * @param productType - Type de produit pour déterminer le bucket
 * @param filename - Nom du fichier (optionnel, généré automatiquement si absent)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImageByType(file: File, productType: ProductType, filename?: string): Promise<UploadResult> {
  try {
    const bucketName = BUCKET_NAMES[productType];
    
    // Générer un nom de fichier unique si non fourni
    const fileExt = file.name.split('.').pop();
    const fileName = filename || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucketName)
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
      .from(bucketName)
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
 * Upload une image depuis base64 vers le bucket spécifique au type de produit
 * @param base64Data - Données base64 de l'image
 * @param productType - Type de produit pour déterminer le bucket
 * @param filename - Nom du fichier (optionnel)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImageFromBase64ByType(base64Data: string, productType: ProductType, filename?: string): Promise<UploadResult> {
  try {
    // Convertir base64 en blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // Créer un objet File depuis le blob
    const fileExt = base64Data.includes('data:image/png') ? 'png' : 'jpg';
    const fileName = filename || `camera-${Date.now()}.${fileExt}`;
    const file = new File([blob], fileName, { type: blob.type });
    
    // Upload avec la fonction par type
    return await uploadImageByType(file, productType, fileName);
  } catch (error) {
    console.error('Erreur conversion base64:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur conversion base64' 
    };
  }
}

/**
 * Upload une image vers le bucket Supabase Storage (fonction legacy)
 * @param file - Fichier image à uploader
 * @param filename - Nom du fichier (optionnel, généré automatiquement si absent)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImage(file: File, filename?: string): Promise<UploadResult> {
  return uploadImageByType(file, 'pc-portable', filename);
}

/**
 * Upload une image depuis base64 (pour les photos de caméra) - fonction legacy
 * @param base64Data - Données base64 de l'image
 * @param filename - Nom du fichier (optionnel)
 * @returns Promise avec l'URL publique de l'image ou une erreur
 */
export async function uploadImageFromBase64(base64Data: string, filename?: string): Promise<UploadResult> {
  return uploadImageFromBase64ByType(base64Data, 'pc-portable', filename);
}

/**
 * Supprimer une image du bucket
 * @param url - URL publique de l'image à supprimer
 * @param productType - Type de produit pour déterminer le bucket (optionnel)
 * @returns Promise<boolean> - true si suppression réussie
 */
export async function deleteImage(url: string, productType?: ProductType): Promise<boolean> {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Déterminer le bucket depuis l'URL ou utiliser le type fourni
    let bucketName = DEFAULT_BUCKET_NAME;
    if (productType) {
      bucketName = BUCKET_NAMES[productType];
    } else {
      // Essayer de déterminer le bucket depuis l'URL
      for (const [type, bucket] of Object.entries(BUCKET_NAMES)) {
        if (url.includes(bucket)) {
          bucketName = bucket;
          break;
        }
      }
    }
    
    const { error } = await supabase.storage
      .from(bucketName)
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
 * @param productType - Type de produit pour déterminer le bucket
 * @returns URL publique
 */
export function getImageUrlByType(path: string, productType: ProductType): string {
  const bucketName = BUCKET_NAMES[productType];
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);
  
  return publicUrl;
}

/**
 * Obtenir l'URL publique d'une image (fonction legacy)
 * @param path - Chemin du fichier dans le bucket
 * @returns URL publique
 */
export function getImageUrl(path: string): string {
  return getImageUrlByType(path, 'pc-portable');
}

// Export des types et constantes
export { BUCKET_NAMES, type ProductType }; 