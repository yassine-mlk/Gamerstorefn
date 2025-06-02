// Utilitaire pour générer des UUIDs et convertir les timestamps
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Convertir un timestamp en UUID valide
export function timestampToUUID(timestamp: string | number): string {
  const timestampStr = timestamp.toString();
  
  // Si c'est déjà un UUID valide, le retourner
  if (isValidUUID(timestampStr)) {
    return timestampStr;
  }
  
  // Convertir le timestamp en UUID déterministe
  const paddedTimestamp = timestampStr.padStart(12, '0').slice(-12);
  return `00000000-0000-0000-0000-${paddedTimestamp}`;
}

// Vérifier si une chaîne est un UUID valide
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Convertir un ID de produit en format sûr pour la base de données
export function safeProductId(id: string | number): string {
  const idStr = id.toString();
  
  // Si c'est déjà un UUID, le retourner
  if (isValidUUID(idStr)) {
    return idStr;
  }
  
  // Si c'est un timestamp numérique, le convertir
  if (/^\d+$/.test(idStr)) {
    return timestampToUUID(idStr);
  }
  
  // Sinon, préfixer avec "product_" pour éviter les erreurs
  return `product_${idStr}`;
} 