// 🔍 Script de débogage pour l'erreur 409
// Exécutez ce script dans la console du navigateur (F12)

console.log('🔍 Début du débogage de l\'erreur 409');

// 1. Vérifier l'état de l'authentification Supabase
async function checkSupabaseAuth() {
  try {
    console.log('📋 Vérification de l\'authentification Supabase...');
    
    // Vérifier la session actuelle
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur de session:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Session active trouvée:', {
        user: session.user?.email,
        expires_at: session.expires_at,
        access_token: session.access_token ? 'Présent' : 'Absent'
      });
      return true;
    } else {
      console.log('⚠️ Aucune session active');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
}

// 2. Tester l'accès à la table clients
async function testClientsAccess() {
  try {
    console.log('📋 Test d\'accès à la table clients...');
    
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur d\'accès à clients:', error);
      return false;
    }
    
    console.log('✅ Accès à la table clients réussi');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'accès:', error);
    return false;
  }
}

// 3. Vérifier les données locales
function checkLocalStorage() {
  console.log('📋 Vérification du localStorage...');
  
  const authData = localStorage.getItem('sb-ljaaqattzvklzjftkyrq-auth-token');
  const userData = localStorage.getItem('sb-ljaaqattzvklzjftkyrq-user');
  
  console.log('🔑 Token stocké:', authData ? 'Présent' : 'Absent');
  console.log('👤 Données utilisateur:', userData ? 'Présentes' : 'Absentes');
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('📅 Expiration du token:', new Date(parsed.expires_at * 1000));
    } catch (e) {
      console.log('❌ Token invalide');
    }
  }
}

// 4. Fonction principale de débogage
async function debugAuthIssue() {
  console.log('🚀 Début du débogage...');
  
  // Vérifier l'authentification
  const isAuthenticated = await checkSupabaseAuth();
  
  // Vérifier l'accès aux clients
  const canAccessClients = await testClientsAccess();
  
  // Vérifier le localStorage
  checkLocalStorage();
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DU DÉBOGAGE:');
  console.log('Authentification:', isAuthenticated ? '✅ OK' : '❌ ÉCHEC');
  console.log('Accès clients:', canAccessClients ? '✅ OK' : '❌ ÉCHEC');
  
  if (!isAuthenticated) {
    console.log('💡 SOLUTION: Se reconnecter à l\'application');
  } else if (!canAccessClients) {
    console.log('💡 SOLUTION: Problème de permissions RLS');
  } else {
    console.log('💡 SOLUTION: Problème de cache ou de session');
  }
}

// Exécuter le débogage
debugAuthIssue(); 