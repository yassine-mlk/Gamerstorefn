// Script de debug pour les images dans les factures
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFactureImages() {
  console.log('🔍 Debug des images dans les factures...\n');

  try {
    // 1. Vérifier la structure de la table ventes_articles
    console.log('1. Vérification de la structure de ventes_articles:');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'ventes_articles')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
    } else {
      console.log('✅ Colonnes de ventes_articles:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 2. Vérifier les ventes récentes avec leurs articles
    console.log('\n2. Vérification des ventes récentes:');
    const { data: ventes, error: ventesError } = await supabase
      .from('ventes')
      .select(`
        id,
        numero_vente,
        date_vente,
        client_nom,
        articles:ventes_articles(
          id,
          nom_produit,
          image_url,
          produit_type,
          created_at
        )
      `)
      .order('date_vente', { ascending: false })
      .limit(5);

    if (ventesError) {
      console.error('❌ Erreur lors de la récupération des ventes:', ventesError);
    } else {
      console.log('✅ Ventes récentes:');
      ventes.forEach(vente => {
        console.log(`\n   Vente ${vente.numero_vente} (${vente.client_nom}):`);
        if (vente.articles && vente.articles.length > 0) {
          vente.articles.forEach(article => {
            console.log(`     - ${article.nom_produit} (${article.produit_type})`);
            console.log(`       image_url: ${article.image_url || 'NULL'}`);
          });
        } else {
          console.log('     - Aucun article trouvé');
        }
      });
    }

    // 3. Vérifier les articles avec des images
    console.log('\n3. Articles avec des images:');
    const { data: articlesWithImages, error: articlesError } = await supabase
      .from('ventes_articles')
      .select('id, nom_produit, image_url, produit_type, created_at')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (articlesError) {
      console.error('❌ Erreur lors de la récupération des articles avec images:', articlesError);
    } else {
      console.log('✅ Articles avec images:');
      if (articlesWithImages.length > 0) {
        articlesWithImages.forEach(article => {
          console.log(`   - ${article.nom_produit} (${article.produit_type})`);
          console.log(`     image_url: ${article.image_url}`);
        });
      } else {
        console.log('   - Aucun article avec image trouvé');
      }
    }

    // 4. Vérifier les produits sources pour voir s'ils ont des images
    console.log('\n4. Vérification des produits sources:');
    const { data: pcPortables, error: pcError } = await supabase
      .from('pc_portables')
      .select('id, nom_produit, image_url')
      .not('image_url', 'is', null)
      .limit(5);

    if (pcError) {
      console.error('❌ Erreur lors de la récupération des PC portables:', pcError);
    } else {
      console.log('✅ PC Portables avec images:');
      if (pcPortables.length > 0) {
        pcPortables.forEach(pc => {
          console.log(`   - ${pc.nom_produit}`);
          console.log(`     image_url: ${pc.image_url}`);
        });
      } else {
        console.log('   - Aucun PC portable avec image trouvé');
      }
    }

    // 5. Test de création d'une vente avec image
    console.log('\n5. Test de création d\'une vente avec image...');
    
    // Trouver un PC portable avec image
    const { data: testProduct } = await supabase
      .from('pc_portables')
      .select('id, nom_produit, image_url, prix_achat, prix_vente')
      .not('image_url', 'is', null)
      .limit(1)
      .single();

    if (testProduct) {
      console.log(`   Produit de test: ${testProduct.nom_produit}`);
      console.log(`   Image URL: ${testProduct.image_url}`);
      
      // Créer une vente de test
      const venteTest = {
        client_nom: 'Test Client Images',
        client_email: 'test@example.com',
        sous_total: testProduct.prix_vente,
        tva: testProduct.prix_vente * 0.2,
        remise: 0,
        total_ht: testProduct.prix_vente / 1.2,
        total_ttc: testProduct.prix_vente,
        mode_paiement: 'especes',
        type_vente: 'vente_directe',
        statut: 'payee'
      };

      const { data: newVente, error: venteTestError } = await supabase
        .from('ventes')
        .insert(venteTest)
        .select()
        .single();

      if (venteTestError) {
        console.error('❌ Erreur lors de la création de la vente de test:', venteTestError);
      } else {
        console.log(`   ✅ Vente de test créée: ${newVente.numero_vente}`);
        
        // Créer l'article de vente avec l'image
        const articleTest = {
          vente_id: newVente.id,
          produit_id: testProduct.id,
          produit_type: 'pc_portable',
          nom_produit: testProduct.nom_produit,
          prix_unitaire_ht: testProduct.prix_vente / 1.2,
          prix_unitaire_ttc: testProduct.prix_vente,
          quantite: 1,
          total_ht: testProduct.prix_vente / 1.2,
          total_ttc: testProduct.prix_vente,
          image_url: testProduct.image_url
        };

        const { data: newArticle, error: articleTestError } = await supabase
          .from('ventes_articles')
          .insert(articleTest)
          .select()
          .single();

        if (articleTestError) {
          console.error('❌ Erreur lors de la création de l\'article de test:', articleTestError);
        } else {
          console.log('   ✅ Article de test créé avec image');
          console.log(`   Image URL dans l'article: ${newArticle.image_url}`);
        }
      }
    } else {
      console.log('   ⚠️ Aucun produit avec image trouvé pour le test');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le debug
debugFactureImages().then(() => {
  console.log('\n🏁 Debug terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
