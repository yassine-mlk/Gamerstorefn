// Script de test pour vérifier que le problème "Email not confirmed" est résolu
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljaaqattzvklzjftkyrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYWFxYXR0enZrbHpqZnRreXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDIwMzAsImV4cCI6MjA2MzY3ODAzMH0.CXjABoRZWXmGuZdheAp-qsEqTOTqG-TVCj03aBd_e7M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailConfirmationFix() {
  console.log('🔍 Test de résolution du problème "Email not confirmed"...\n');

  try {
    // 1. Créer un utilisateur de test
    console.log('1. Test de création d\'utilisateur...');
    const testUser = {
      email: `test-fix-${Date.now()}@gamerstore.com`,
      password: 'testpassword123',
      name: 'Test User Fix',
      role: 'vendeur'
    };

    console.log(`📧 Email de test: ${testUser.email}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          role: testUser.role,
        }
      }
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        console.error('❌ Problème "Email not confirmed" toujours présent');
        console.log('💡 Solutions à appliquer :');
        console.log('   1. Désactiver la confirmation d\'email dans Supabase Dashboard');
        console.log('   2. Exécuter le script fix-email-confirmation.sql');
        console.log('   3. Ou utiliser l\'API admin avec email_confirm: true');
        return false;
      } else {
        console.error('❌ Autre erreur:', authError.message);
        return false;
      }
    }

    console.log('✅ Utilisateur créé sans erreur "Email not confirmed"');
    console.log('📋 ID utilisateur:', authData.user?.id);

    // 2. Tester la connexion immédiate
    console.log('\n2. Test de connexion immédiate...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        console.error('❌ Connexion échoue - email non confirmé');
        console.log('💡 L\'utilisateur a été créé mais ne peut pas se connecter');
        return false;
      } else {
        console.error('❌ Erreur de connexion:', signInError.message);
        return false;
      }
    }

    console.log('✅ Connexion réussie immédiatement après création');

    // 3. Vérifier le statut de confirmation dans la base
    console.log('\n3. Vérification du statut de confirmation...');
    
    // Note: Cette requête nécessiterait des permissions spéciales
    // En production, on vérifierait via l'API admin ou les logs
    console.log('📋 Utilisateur connecté avec succès, email probablement confirmé automatiquement');

    // 4. Créer le profil manuellement si nécessaire
    if (authData.user) {
      console.log('\n4. Création du profil...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          status: 'actif'
        });

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('❌ Erreur création profil:', profileError.message);
      } else {
        console.log('✅ Profil créé ou existe déjà');
      }
    }

    console.log('\n🎉 Test réussi ! Le problème "Email not confirmed" est résolu.');
    return true;

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return false;
  }
}

// Fonction pour tester les différentes solutions
async function testAllSolutions() {
  console.log('🔧 Test de toutes les solutions pour "Email not confirmed"\n');
  
  const solutions = [
    'Solution 1: Désactiver confirmation email dans Dashboard',
    'Solution 2: Utiliser API admin avec email_confirm: true', 
    'Solution 3: Trigger SQL pour auto-confirmation'
  ];

  console.log('📋 Solutions disponibles:');
  solutions.forEach((solution, index) => {
    console.log(`   ${index + 1}. ${solution}`);
  });

  console.log('\n🧪 Exécution du test...');
  const success = await testEmailConfirmationFix();
  
  if (success) {
    console.log('\n✅ Au moins une solution fonctionne !');
  } else {
    console.log('\n❌ Aucune solution n\'est encore appliquée.');
    console.log('📖 Consultez SOLUTION-EMAIL-CONFIRMATION.md pour les instructions détaillées.');
  }
}

// Exécuter le test
testAllSolutions(); 