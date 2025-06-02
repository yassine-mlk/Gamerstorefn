// Script de test pour diagnostiquer les problèmes de création d'utilisateurs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljaaqattzvklzjftkyrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYWFxYXR0enZrbHpqZnRreXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDIwMzAsImV4cCI6MjA2MzY3ODAzMH0.CXjABoRZWXmGuZdheAp-qsEqTOTqG-TVCj03aBd_e7M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTeamCreation() {
  console.log('🔍 Test de création d\'utilisateur...\n');

  try {
    // 1. Vérifier la connexion à Supabase
    console.log('1. Test de connexion à Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Erreur de session:', sessionError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK');

    // 2. Vérifier l'existence de la table profiles
    console.log('\n2. Vérification de la table profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erreur table profiles:', profilesError.message);
      console.log('💡 Solution: Créez la table profiles avec le script create-profiles-table.sql');
      return;
    }
    console.log('✅ Table profiles accessible');

    // 3. Test de création d'utilisateur
    console.log('\n3. Test de création d\'utilisateur...');
    const testUser = {
      email: `test-${Date.now()}@gamerstore.com`,
      password: 'testpassword123',
      name: 'Test User',
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
      console.error('❌ Erreur création auth:', authError.message);
      
      // Diagnostics spécifiques
      if (authError.message.includes('User already registered')) {
        console.log('💡 L\'utilisateur existe déjà');
      } else if (authError.message.includes('Invalid email')) {
        console.log('💡 Format d\'email invalide');
      } else if (authError.message.includes('Password')) {
        console.log('💡 Problème avec le mot de passe (min 6 caractères)');
      } else if (authError.message.includes('signup')) {
        console.log('💡 L\'inscription pourrait être désactivée dans Supabase');
      }
      return;
    }

    console.log('✅ Utilisateur auth créé:', authData.user?.id);

    // 4. Vérifier la création du profil
    if (authData.user) {
      console.log('\n4. Vérification du profil...');
      
      // Attendre un peu pour le trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError.message);
        
        // Essayer de créer manuellement
        console.log('🔧 Tentative de création manuelle du profil...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            status: 'actif'
          });

        if (insertError) {
          console.error('❌ Erreur création manuelle:', insertError.message);
        } else {
          console.log('✅ Profil créé manuellement');
        }
      } else {
        console.log('✅ Profil trouvé:', profile);
      }
    }

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter le test
testTeamCreation(); 