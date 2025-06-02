// Script to check Supabase configuration for team management
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkSupabaseSetup = async () => {
  console.log('🔍 Vérification de la configuration Supabase...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL manquant dans le fichier .env');
    return false;
  }

  if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY manquant dans le fichier .env');
    return false;
  }

  console.log('✅ Variables d\'environnement trouvées');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    console.log('\n🔗 Test de connexion Supabase...');
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n💡 Solution: Exécutez le script create-profiles-table.sql dans votre Supabase Dashboard');
        console.log('   1. Ouvrez https://supabase.com/dashboard');
        console.log('   2. Allez dans SQL Editor');
        console.log('   3. Collez le contenu de create-profiles-table.sql');
        console.log('   4. Exécutez le script');
      }
      
      return false;
    }

    console.log('✅ Connexion Supabase réussie');

    // Check if profiles table exists and has correct structure
    console.log('\n🗄️  Vérification de la table profiles...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('id, email, name, role, status, created_at')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError.message);
      return false;
    }

    console.log('✅ Table profiles accessible');

    // Check for admin users
    console.log('\n👑 Vérification des utilisateurs admin...');
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, name, role')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Erreur lors de la recherche d\'admins:', adminError.message);
      return false;
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  Aucun utilisateur admin trouvé');
      console.log('\n💡 Pour créer un admin:');
      console.log('   1. Allez dans Supabase Dashboard > Authentication > Users');
      console.log('   2. Créez un utilisateur avec les métadonnées: {"name": "Votre Nom", "role": "admin"}');
      console.log('   3. Ou mettez à jour un utilisateur existant avec:');
      console.log('      UPDATE profiles SET role = \'admin\' WHERE email = \'votre-email@example.com\';');
    } else {
      console.log(`✅ ${admins.length} utilisateur(s) admin trouvé(s):`);
      admins.forEach(admin => {
        console.log(`   - ${admin.name || admin.email} (${admin.email})`);
      });
    }

    // Check RLS policies
    console.log('\n🔒 Test des politiques de sécurité...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (testError) {
        console.log('⚠️  Politiques RLS actives (normal pour les utilisateurs non connectés)');
      } else {
        console.log('✅ Accès aux données autorisé');
      }
    } catch (error) {
      console.log('⚠️  Test des politiques RLS non concluant');
    }

    console.log('\n🎉 Configuration Supabase prête pour la gestion d\'équipe !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Assurez-vous d\'avoir un utilisateur admin');
    console.log('   2. Lancez l\'application: npm run dev');
    console.log('   3. Connectez-vous en tant qu\'admin');
    console.log('   4. Allez dans "Équipe" pour créer vos premiers membres');

    return true;

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return false;
  }
};

// Run the check
checkSupabaseSetup().then(success => {
  if (!success) {
    console.log('\n❌ Configuration incomplète. Consultez SUPABASE_TEAM_MANAGEMENT_SETUP.md pour l\'aide');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
}); 