// 🔧 Script de correction pour l'authentification frontend
// Exécutez ce script dans la console du navigateur (F12) pour corriger les problèmes d'auth

console.log('🔧 Début de la correction de l\'authentification frontend');

// 1. Nettoyer toutes les données d'authentification
function clearAllAuthData() {
  console.log('🧹 Nettoyage des données d\'authentification...');
  
  // Nettoyer le localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Supprimé: ${key}`);
  });
  
  // Nettoyer le sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Supprimé (session): ${key}`);
  });
  
  console.log('✅ Nettoyage terminé');
}

// 2. Se déconnecter proprement
async function signOut() {
  try {
    console.log('🚪 Déconnexion...');
    
    if (typeof supabase !== 'undefined') {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
      } else {
        console.log('✅ Déconnexion réussie');
      }
    } else {
      console.log('⚠️ Supabase non disponible, déconnexion forcée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  }
}

// 3. Forcer le rafraîchissement de la page
function forceRefresh() {
  console.log('🔄 Rafraîchissement forcé de la page...');
  
  // Nettoyer le cache du navigateur
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log(`🗑️ Cache supprimé: ${name}`);
      });
    });
  }
  
  // Forcer le rechargement
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

// 4. Vérifier et corriger l'état de l'authentification
async function fixAuthState() {
  try {
    console.log('🔧 Correction de l\'état d\'authentification...');
    
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase non disponible');
      return false;
    }
    
    // Vérifier la session actuelle
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur de session:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Session valide trouvée');
      
      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.warn('⚠️ Token expiré, déconnexion...');
        await signOut();
        return false;
      }
      
      // Tester l'accès à la base de données
      const { data, error: dbError } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      if (dbError) {
        console.error('❌ Erreur d\'accès à la base:', dbError);
        return false;
      }
      
      console.log('✅ Accès à la base de données OK');
      return true;
    } else {
      console.log('⚠️ Aucune session active');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return false;
  }
}

// 5. Fonction principale de correction
async function fixFrontendAuth() {
  console.log('🚀 Début de la correction...');
  
  // Étape 1: Nettoyer les données
  clearAllAuthData();
  
  // Étape 2: Se déconnecter
  await signOut();
  
  // Étape 3: Attendre un peu
  console.log('⏳ Attente de 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Étape 4: Vérifier l'état
  const isFixed = await fixAuthState();
  
  if (isFixed) {
    console.log('✅ Correction réussie! L\'authentification fonctionne.');
    console.log('💡 Vous pouvez maintenant tester l\'ajout de clients.');
  } else {
    console.log('⚠️ Correction partielle. Vous devrez vous reconnecter.');
    console.log('💡 Allez sur la page de connexion et reconnectez-vous.');
  }
  
  // Étape 5: Rafraîchir la page
  console.log('🔄 Rafraîchissement de la page dans 3 secondes...');
  setTimeout(() => {
    forceRefresh();
  }, 3000);
}

// Exécuter la correction
fixFrontendAuth(); 