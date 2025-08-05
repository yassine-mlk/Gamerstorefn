// 🔍 Script de débogage pour l'authentification frontend
// Exécutez ce script dans la console du navigateur (F12) sur votre application

console.log('🔍 Début du débogage de l\'authentification frontend');

// 1. Vérifier si supabase est disponible
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase n\'est pas disponible dans le contexte global');
  console.log('💡 Assurez-vous d\'être sur une page de votre application');
} else {
  console.log('✅ Supabase est disponible');
}

// 2. Vérifier l'état de l'authentification
async function checkAuthState() {
  try {
    console.log('📋 Vérification de l\'état d\'authentification...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Session active trouvée:', {
        user: session.user?.email,
        expires_at: session.expires_at,
        access_token: session.access_token ? 'Présent' : 'Absent',
        refresh_token: session.refresh_token ? 'Présent' : 'Absent'
      });
      
      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.warn('⚠️ Token expiré!');
        return false;
      }
      
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

// 3. Tester l'accès à la table clients avec l'authentification actuelle
async function testClientsAccess() {
  try {
    console.log('📋 Test d\'accès à la table clients...');
    
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur d\'accès à clients:', error);
      console.log('🔍 Code d\'erreur:', error.code);
      console.log('🔍 Message d\'erreur:', error.message);
      return false;
    }
    
    console.log('✅ Accès à la table clients réussi');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'accès:', error);
    return false;
  }
}

// 4. Tester l'insertion d'un client
async function testClientInsertion() {
  try {
    console.log('📋 Test d\'insertion d\'un client...');
    
    const testClient = {
      nom: 'Test Frontend',
      prenom: 'Debug',
      email: `test-frontend-${Date.now()}@example.com`,
      statut: 'Actif'
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert([testClient])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur d\'insertion:', error);
      console.log('🔍 Code d\'erreur:', error.code);
      console.log('🔍 Message d\'erreur:', error.message);
      return false;
    }
    
    console.log('✅ Insertion réussie:', data);
    
    // Nettoyer le client de test
    await supabase
      .from('clients')
      .delete()
      .eq('id', data.id);
    
    console.log('🧹 Client de test supprimé');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test d\'insertion:', error);
    return false;
  }
}

// 5. Vérifier le localStorage
function checkLocalStorage() {
  console.log('📋 Vérification du localStorage...');
  
  // Vérifier les clés Supabase
  const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
  console.log('🔑 Clés Supabase trouvées:', supabaseKeys);
  
  supabaseKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        console.log(`📄 ${key}:`, {
          type: typeof parsed,
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : 'N/A'
        });
      }
    } catch (e) {
      console.log(`📄 ${key}: Données non-JSON`);
    }
  });
}

// 6. Fonction principale de débogage
async function debugFrontendAuth() {
  console.log('🚀 Début du débogage frontend...');
  
  // Vérifier l'authentification
  const isAuthenticated = await checkAuthState();
  
  // Vérifier l'accès aux clients
  const canAccessClients = await testClientsAccess();
  
  // Tester l'insertion
  const canInsertClients = await testClientInsertion();
  
  // Vérifier le localStorage
  checkLocalStorage();
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DU DÉBOGAGE FRONTEND:');
  console.log('Authentification:', isAuthenticated ? '✅ OK' : '❌ ÉCHEC');
  console.log('Accès clients:', canAccessClients ? '✅ OK' : '❌ ÉCHEC');
  console.log('Insertion clients:', canInsertClients ? '✅ OK' : '❌ ÉCHEC');
  
  if (!isAuthenticated) {
    console.log('💡 SOLUTION: Se reconnecter à l\'application');
  } else if (!canAccessClients) {
    console.log('💡 SOLUTION: Problème de permissions RLS');
  } else if (!canInsertClients) {
    console.log('💡 SOLUTION: Problème spécifique à l\'insertion');
  } else {
    console.log('💡 SOLUTION: Problème dans le composant React');
  }
}

// Exécuter le débogage
debugFrontendAuth(); 