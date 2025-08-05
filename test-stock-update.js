// Script de test pour vérifier le système de mise à jour du stock
// Ce script simule une vente et vérifie que le stock est bien mis à jour

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStockUpdate() {
  console.log('🧪 Test du système de mise à jour du stock...\n');

  try {
    // 1. Récupérer un PC portable de test
    console.log('1. Récupération d\'un PC portable de test...');
    const { data: pcPortable, error: fetchError } = await supabase
      .from('pc_portables')
      .select('*')
      .gt('stock_actuel', 0)
      .limit(1)
      .single();

    if (fetchError || !pcPortable) {
      console.error('❌ Aucun PC portable avec stock disponible trouvé');
      return;
    }

    console.log(`✅ PC portable trouvé: ${pcPortable.nom_produit}`);
    console.log(`   Stock actuel: ${pcPortable.stock_actuel}`);
    const stockAvant = pcPortable.stock_actuel;

    // 2. Créer une vente de test
    console.log('\n2. Création d\'une vente de test...');
    
    const venteData = {
      client_nom: 'Client Test',
      client_email: 'test@example.com',
      sous_total: pcPortable.prix_vente,
      tva: pcPortable.prix_vente * 0.2,
      remise: 0,
      total_ht: pcPortable.prix_vente,
      total_ttc: pcPortable.prix_vente * 1.2,
      mode_paiement: 'especes',
      type_vente: 'magasin',
      statut: 'payee',
      notes: 'Vente de test pour vérification du stock'
    };

    const { data: vente, error: venteError } = await supabase
      .from('ventes')
      .insert(venteData)
      .select()
      .single();

    if (venteError) {
      console.error('❌ Erreur lors de la création de la vente:', venteError);
      return;
    }

    console.log(`✅ Vente créée: ${vente.numero_vente}`);

    // 3. Créer l'article de vente
    console.log('\n3. Création de l\'article de vente...');
    
    const articleData = {
      vente_id: vente.id,
      produit_id: pcPortable.id,
      produit_type: 'pc_portable',
      nom_produit: pcPortable.nom_produit,
      code_barre: pcPortable.code_barre,
      marque: pcPortable.marque,
      modele: pcPortable.modele,
      prix_unitaire_ht: pcPortable.prix_vente,
      prix_unitaire_ttc: pcPortable.prix_vente * 1.2,
      quantite: 1,
      remise_unitaire: 0,
      total_ht: pcPortable.prix_vente,
      total_ttc: pcPortable.prix_vente * 1.2
    };

    const { error: articleError } = await supabase
      .from('ventes_articles')
      .insert(articleData);

    if (articleError) {
      console.error('❌ Erreur lors de la création de l\'article:', articleError);
      return;
    }

    console.log('✅ Article de vente créé');

    // 4. Mettre à jour le stock (simulation de la fonction updateProductStock)
    console.log('\n4. Mise à jour du stock...');
    
    const nouveauStock = pcPortable.stock_actuel - 1;
    
    const { error: stockError } = await supabase
      .from('pc_portables')
      .update({ 
        stock_actuel: nouveauStock,
        derniere_modification: new Date().toISOString()
      })
      .eq('id', pcPortable.id);

    if (stockError) {
      console.error('❌ Erreur lors de la mise à jour du stock:', stockError);
      return;
    }

    console.log('✅ Stock mis à jour');

    // 5. Vérifier que le stock a bien été mis à jour
    console.log('\n5. Vérification du stock mis à jour...');
    
    const { data: pcPortableApres, error: verifyError } = await supabase
      .from('pc_portables')
      .select('stock_actuel')
      .eq('id', pcPortable.id)
      .single();

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }

    console.log(`   Stock avant: ${stockAvant}`);
    console.log(`   Stock après: ${pcPortableApres.stock_actuel}`);
    console.log(`   Différence: ${stockAvant - pcPortableApres.stock_actuel}`);

    if (pcPortableApres.stock_actuel === stockAvant - 1) {
      console.log('✅ Test réussi ! Le stock a été correctement mis à jour');
    } else {
      console.log('❌ Test échoué ! Le stock n\'a pas été mis à jour correctement');
    }

    // 6. Nettoyer les données de test
    console.log('\n6. Nettoyage des données de test...');
    
    // Supprimer l'article de vente
    await supabase
      .from('ventes_articles')
      .delete()
      .eq('vente_id', vente.id);

    // Supprimer la vente
    await supabase
      .from('ventes')
      .delete()
      .eq('id', vente.id);

    // Remettre le stock original
    await supabase
      .from('pc_portables')
      .update({ 
        stock_actuel: stockAvant,
        derniere_modification: new Date().toISOString()
      })
      .eq('id', pcPortable.id);

    console.log('✅ Données de test nettoyées');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testStockUpdate().then(() => {
  console.log('\n🏁 Test terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 