// Constantes globales de l'application Gamerstore

// Options de garantie standardisées pour tous les produits
export const GARANTIE_OPTIONS = [
  "Sans garantie",
  "3 mois", 
  "6 mois",
  "9 mois",
  "12 mois"
] as const;

// Type TypeScript pour la garantie
export type GarantieOption = typeof GARANTIE_OPTIONS[number];

// États des produits
export const ETAT_OPTIONS = [
  "Neuf",
  "Comme neuf", 
  "Occasion"
] as const;

export type EtatOption = typeof ETAT_OPTIONS[number];

// Statuts de stock
export const STATUT_STOCK_OPTIONS = [
  "Disponible",
  "Stock faible",
  "Rupture", 
  "Réservé",
  "Archivé"
] as const;

export type StatutStockOption = typeof STATUT_STOCK_OPTIONS[number]; 