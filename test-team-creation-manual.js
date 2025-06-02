// Script de test avec création manuelle de profil
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljaaqattzvklzjftkyrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYWFxYXR0enZrbHpqZnRreXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDIwMzAsImV4cCI6MjA2MzY3ODAzMH0.CXjABoRZWXmGuZdheAp-qsEqTOTqG-TVCj03aBd_e7M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testManualProfileCreation() {
  console.log('🔍 Test de création manuelle de profil...\n');

  try {
    // 1. Test de création d'utilisateur avec un email simple
    console.log('1. Test de création d\'utilisateur...');
    const testUser = {
      email: `simple-test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User Manual',
      role: 'vendeur'
    };

    console.log(`📧 Email de test: ${testUser.email}`);

    // Essayer de créer l'utilisateur sans métadonnées d'abord
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    if (authError) {
      console.error('❌ Erreur création auth:', authError.message);
      
      // Essayer avec des métadonnées minimales
      console.log('🔄 Tentative avec métadonnées minimales...');
      const { data: authData2, error: authError2 } = await supabase.auth.signUp({
        email: `minimal-${Date.now()}@example.com`,
        password: 'password123',
        options: {
          data: {
            name: 'Test User'
          }
        }
      });

      if (authError2) {
        console.error('❌ Erreur avec métadonnées minimales:', authError2.message);
        return;
      } else {
        console.log('✅ Utilisateur créé avec métadonnées minimales');
        // Utiliser les données de la deuxième tentative
        authData.user = authData2.user;
      }
    } else {
      console.log('✅ Utilisateur auth créé:', authData.user?.id);
    }

    // 2. Créer manuellement le profil
    if (authData.user) {
      console.log('\n2. Création manuelle du profil...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: testUser.name,
          role: testUser.role,
          status: 'actif'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erreur création profil:', profileError.message);
        console.log('💡 Détails:', profileError);
      } else {
        console.log('✅ Profil créé manuellement:', profile);
      }

      // 3. Vérifier que le profil existe
      console.log('\n3. Vérification du profil...');
      const { data: checkProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (checkError) {
        console.error('❌ Erreur vérification:', checkError.message);
      } else {
        console.log('✅ Profil vérifié:', checkProfile);
      }
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter le test
testManualProfileCreation(); 