import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug temporaire - vérifier les variables d'environnement
console.log('=== VÉRIFICATION ENVIRONNEMENT ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY présent:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_SUPABASE_ANON_KEY longueur:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
} else {
  console.log('✅ Variables d\'environnement trouvées');
}

createRoot(document.getElementById("root")!).render(<App />);
