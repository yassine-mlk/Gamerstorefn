# Solution pour "Email not confirmed"

## Problème
L'erreur `"code": "email_not_confirmed", "message": "Email not confirmed"` apparaît lors de la création d'utilisateurs car Supabase exige par défaut une confirmation d'email.

## Solutions

### Solution 1 : Désactiver la confirmation d'email (Recommandé pour le développement)

1. **Aller dans Supabase Dashboard :**
   - Connectez-vous à https://app.supabase.com
   - Sélectionnez votre projet Gamerstore
   - Allez dans **Authentication** > **Providers**

2. **Désactiver la confirmation d'email :**
   - Trouvez la section "Email"
   - Désactivez le toggle "Confirm email"
   - Cliquez sur "Save"

### Solution 2 : Utiliser l'API Admin avec email_confirm: true

Modifier le code pour utiliser l'API admin qui permet de créer des utilisateurs pré-confirmés :

```javascript
// Dans useMembers.ts - remplacer la création d'utilisateur par :
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: memberData.email,
  password: memberData.password,
  email_confirm: true, // ← Ceci confirme automatiquement l'email
  user_metadata: {
    name: memberData.name,
    role: memberData.role,
  }
});
```

**Note :** Cette méthode nécessite d'utiliser la clé SERVICE_ROLE au lieu de la clé ANON.

### Solution 3 : Trigger SQL pour auto-confirmer

Exécuter le script `fix-email-confirmation-simple.sql` dans Supabase pour auto-confirmer tous les nouveaux utilisateurs.

**Important :** La colonne `confirmed_at` est une colonne générée dans Supabase et ne peut pas être mise à jour directement. Il faut seulement mettre à jour `email_confirmed_at`.

```sql
-- Fonction corrigée pour auto-confirmer les utilisateurs
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement email_confirmed_at (confirmed_at est généré automatiquement)
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Recommandation

Pour le développement et les tests, utilisez la **Solution 1** (désactiver la confirmation d'email).

Pour la production, gardez la confirmation d'email activée et utilisez la **Solution 2** avec l'API admin pour créer des utilisateurs pré-confirmés.

## Vérification

Après avoir appliqué une solution, testez la création d'utilisateur :
1. Allez dans la page Team de votre application
2. Créez un nouvel utilisateur
3. L'utilisateur devrait être créé sans erreur "Email not confirmed" 