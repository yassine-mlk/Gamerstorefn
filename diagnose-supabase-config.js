// Script de diagnostic pour la configuration Supabase
// Usage: node diagnose-supabase-config.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Charger les variables d'environnement
dotenv.config();

console.log('🔍 DIAGNOSTIC CONFIGURATION SUPABASE\n');

// 1. Vérifier les variables d'environnement
console.log('📋 1. VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT');
console.log('================================================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.log('❌ VITE_SUPABASE_URL : MANQUANT');
} else {
  console.log(`✅ VITE_SUPABASE_URL : ${supabaseUrl}`);
}

if (!supabaseAnonKey) {
  console.log('❌ VITE_SUPABASE_ANON_KEY : MANQUANT');
} else {
  console.log(`✅ VITE_SUPABASE_ANON_KEY : ${supabaseAnonKey.substring(0, 20)}...`);
}

if (!supabaseServiceKey) {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY : MANQUANT');
  console.log('   🔧 Solution : Ajoutez cette clé dans votre fichier .env');
  console.log('   📍 Trouvez-la dans Supabase Dashboard > Settings > API');
} else {
  console.log(`✅ VITE_SUPABASE_SERVICE_ROLE_KEY : ${supabaseServiceKey.substring(0, 20)}...`);
}

console.log('\n');

// 2. Tester la connexion
if (supabaseUrl && supabaseAnonKey) {
  console.log('🔗 2. TEST DE CONNEXION SUPABASE');
  console.log('=================================');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.log('❌ CONNEXION ÉCHOUÉE');
      console.log(`   Erreur : ${error.message}`);
      
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n💡 SOLUTION :');
        console.log('   1. Allez dans Supabase Dashboard > SQL Editor');
        console.log('   2. Exécutez le fichier create-profiles-table.sql');
        console.log('   3. Vérifiez que la table profiles est créée');
      }
    } else {
      console.log('✅ CONNEXION RÉUSSIE');
      console.log('✅ Table profiles accessible');
    }
  } catch (error) {
    console.log('❌ ERREUR DE CONNEXION :', error.message);
  }
  
  console.log('\n');
  
  // 3. Tester le client admin
  console.log('👑 3. TEST DU CLIENT ADMIN');
  console.log('==========================');
  
  if (supabaseServiceKey) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      // Test admin capabilities
      const { data: users, error: adminError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (adminError) {
        console.log('❌ CLIENT ADMIN ÉCHOUÉ');
        console.log(`   Erreur : ${adminError.message}`);
        console.log('   🔧 Vérifiez que votre clé SERVICE_ROLE est correcte');
      } else {
        console.log('✅ CLIENT ADMIN FONCTIONNEL');
        console.log(`✅ ${users.users?.length || 0} utilisateurs trouvés`);
      }
    } catch (error) {
      console.log('❌ ERREUR CLIENT ADMIN :', error.message);
    }
  } else {
    console.log('⚠️  CLIENT ADMIN NON CONFIGURÉ (clé SERVICE_ROLE manquante)');
  }
  
  console.log('\n');
  
  // 4. Vérifier les admins existants
  console.log('🕵️  4. VÉRIFICATION DES ADMINS');
  console.log('==============================');
  
  try {
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, name, role')
      .eq('role', 'admin');
    
    if (adminError) {
      console.log('❌ IMPOSSIBLE DE VÉRIFIER LES ADMINS');
      console.log(`   Erreur : ${adminError.message}`);
    } else if (!admins || admins.length === 0) {
      console.log('⚠️  AUCUN ADMIN TROUVÉ');
      console.log('\n💡 SOLUTION POUR CRÉER UN ADMIN :');
      console.log('   1. Supabase Dashboard > Authentication > Users');
      console.log('   2. Créez un utilisateur avec métadonnées :');
      console.log('      {"name": "Votre Nom", "role": "admin"}');
    } else {
      console.log(`✅ ${admins.length} admin(s) trouvé(s) :`);
      admins.forEach(admin => {
        console.log(`   - ${admin.name || admin.email} (${admin.email})`);
      });
    }
  } catch (error) {
    console.log('❌ ERREUR VÉRIFICATION ADMINS :', error.message);
  }
}

console.log('\n');

// 5. Résumé et recommandations
console.log('📋 5. RÉSUMÉ ET RECOMMANDATIONS');
console.log('================================');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('🚨 CONFIGURATION INCOMPLÈTE :');
  console.log('   - Créez un fichier .env à la racine du projet');
  console.log('   - Ajoutez vos clés Supabase');
  console.log('   - Redémarrez l\'application');
} else if (!supabaseServiceKey) {
  console.log('⚠️  CONFIGURATION PARTIELLE :');
  console.log('   - La création de membres utilisera la méthode de fallback');
  console.log('   - Ajoutez VITE_SUPABASE_SERVICE_ROLE_KEY pour une expérience optimale');
} else {
  console.log('✅ CONFIGURATION COMPLÈTE');
  console.log('   - Toutes les clés Supabase sont présentes');
  console.log('   - La création de membres devrait fonctionner parfaitement');
}

console.log('\n📚 RESSOURCES UTILES :');
console.log('   - Guide : FIX_SERVICE_ROLE_CONFIGURATION.md');
console.log('   - Setup : SUPABASE_TEAM_MANAGEMENT_SETUP.md');
console.log('   - SQL : create-profiles-table.sql');

console.log('\n🎯 PROCHAINES ÉTAPES :');
console.log('   1. Corrigez les problèmes identifiés ci-dessus');
console.log('   2. Redémarrez l\'application : npm run dev');
console.log('   3. Testez la création de membres dans la page Team');

console.log('\n✨ Diagnostic terminé !'); 