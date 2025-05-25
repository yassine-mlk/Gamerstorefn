#!/usr/bin/env node

/**
 * Script de vérification des champs de la table pc_portables
 * Vérifie que tous les champs utilisés dans le formulaire correspondent aux champs de la base de données
 */

// Champs requis par l'interface PcPortable du hook
const champsHook = [
  'id',
  'nom_produit', 
  'code_barre',
  'marque',
  'processeur',
  'ram',
  'carte_graphique',
  'stockage',
  'ecran',
  'etat',
  'prix_achat',
  'prix_vente',
  'stock_actuel',
  'stock_minimum',
  'image_url',
  'description',
  'fournisseur_id',
  'emplacement',
  'statut',
  'notes',
  'date_ajout',
  'derniere_modification',
  'created_at',
  'updated_at'
];

// Champs utilisés dans le formulaire actuel PCPortable.tsx
const champsFormulaire = [
  'nom',          // -> nom_produit
  'marque',       // ✓ marque
  'modele',       // ⚠️ MANQUANT dans la table
  'processeur',   // ✓ processeur
  'ram',          // ✓ ram
  'stockage',     // ✓ stockage
  'carteGraphique', // -> carte_graphique
  'ecran',        // ✓ ecran
  'prixAchat',    // -> prix_achat
  'prixVente',    // -> prix_vente
  'stock',        // -> stock_actuel
  'codeBarre',    // -> code_barre
  'fournisseur',  // -> fournisseur_id
  'garantie',     // ⚠️ MANQUANT dans la table
  'image'         // -> image_url
];

// Mapping des champs formulaire vers base de données
const mappingChamps = {
  'nom': 'nom_produit',
  'marque': 'marque',
  'modele': null, // MANQUANT - à ajouter à la table
  'processeur': 'processeur',
  'ram': 'ram',
  'stockage': 'stockage',
  'carteGraphique': 'carte_graphique',
  'ecran': 'ecran',
  'prixAchat': 'prix_achat',
  'prixVente': 'prix_vente',
  'stock': 'stock_actuel',
  'codeBarre': 'code_barre',
  'fournisseur': 'fournisseur_id',
  'garantie': null, // MANQUANT - à ajouter à la table
  'image': 'image_url'
};

console.log('=== VÉRIFICATION DES CHAMPS PC PORTABLES ===\n');

console.log('✅ Champs présents dans la table et utilisés correctement:');
Object.entries(mappingChamps).forEach(([champForm, champDB]) => {
  if (champDB && champsHook.includes(champDB)) {
    console.log(`  ${champForm} -> ${champDB}`);
  }
});

console.log('\n❌ Champs manquants dans la table:');
Object.entries(mappingChamps).forEach(([champForm, champDB]) => {
  if (!champDB) {
    console.log(`  ${champForm} (champ manquant dans la table)`);
  }
});

console.log('\n⚠️  Champs de la table non utilisés dans le formulaire:');
champsHook.forEach(champDB => {
  const estUtilise = Object.values(mappingChamps).includes(champDB);
  if (!estUtilise && champDB !== 'id' && champDB !== 'created_at' && champDB !== 'updated_at') {
    console.log(`  ${champDB}`);
  }
});

console.log('\n=== RECOMMANDATIONS ===\n');

console.log('1. Ajouter ces champs à la table pc_portables:');
console.log('   - modele VARCHAR(100)');
console.log('   - garantie VARCHAR(50)');

console.log('\n2. Le formulaire devrait utiliser fournisseur_id au lieu du nom du fournisseur');

console.log('\n3. Champs recommandés à ajouter au formulaire:');
console.log('   - etat (Neuf/Comme neuf/Occasion)');
console.log('   - stock_minimum');
console.log('   - description');
console.log('   - emplacement');
console.log('   - notes');

console.log('\n=== SQL POUR AJOUTER LES CHAMPS MANQUANTS ===\n');
console.log('-- Ajouter les champs manquants à la table pc_portables');
console.log('ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS modele VARCHAR(100);');
console.log('ALTER TABLE pc_portables ADD COLUMN IF NOT EXISTS garantie VARCHAR(50);'); 