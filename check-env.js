// Script temporaire pour vérifier les variables d'environnement
console.log('=== VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY présent:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

// Vérifier le format de l'URL
const url = import.meta.env.VITE_SUPABASE_URL;
if (url && url.includes('supabase.co')) {
    console.log('✅ URL Supabase semble valide');
} else {
    console.log('❌ URL Supabase invalide ou manquante');
}

// Vérifier le format de la clé
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (key && key.length > 50) {
    console.log('✅ Clé Supabase semble valide');
} else {
    console.log('❌ Clé Supabase invalide ou manquante');
}

export default {}; 