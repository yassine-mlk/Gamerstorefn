-- Table pour tracker les sessions de connexion des membres
CREATE TABLE IF NOT EXISTS member_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  operating_system TEXT,
  browser TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  location_country TEXT,
  location_city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  session_duration INTERVAL GENERATED ALWAYS AS (logout_time - login_time) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_member_sessions_user_id ON member_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_login_time ON member_sessions(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_member_sessions_is_active ON member_sessions(is_active);

-- RLS (Row Level Security)
ALTER TABLE member_sessions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admins can view all sessions" ON member_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON member_sessions;
DROP POLICY IF EXISTS "Allow session creation" ON member_sessions;
DROP POLICY IF EXISTS "Allow session update" ON member_sessions;

-- Politique pour permettre aux admins de voir toutes les sessions
CREATE POLICY "Admins can view all sessions" ON member_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour permettre aux utilisateurs de voir leurs propres sessions
CREATE POLICY "Users can view own sessions" ON member_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Politique pour permettre l'insertion de nouvelles sessions
CREATE POLICY "Allow session creation" ON member_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politique pour permettre la mise à jour des sessions (pour logout)
CREATE POLICY "Allow session update" ON member_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_member_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique
DROP TRIGGER IF EXISTS trigger_update_member_sessions_updated_at ON member_sessions;
CREATE TRIGGER trigger_update_member_sessions_updated_at
  BEFORE UPDATE ON member_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_member_sessions_updated_at();

-- Supprimer l'ancienne vue si elle existe
DROP VIEW IF EXISTS member_last_sessions;

-- Vue améliorée pour obtenir les informations de dernière connexion
CREATE OR REPLACE VIEW member_last_sessions AS
SELECT DISTINCT ON (user_id)
  user_id,
  login_time,
  logout_time,
  ip_address,
  operating_system,
  browser,
  device_type,
  location_country,
  location_city,
  is_active
FROM member_sessions
ORDER BY user_id, login_time DESC;

-- Accorder les permissions sur la vue
GRANT SELECT ON member_last_sessions TO authenticated;

-- Fonction pour nettoyer les sessions zombies (sessions actives depuis plus de 24h)
CREATE OR REPLACE FUNCTION clean_zombie_sessions()
RETURNS void AS $$
BEGIN
  UPDATE member_sessions 
  SET logout_time = NOW(), 
      is_active = false 
  WHERE is_active = true 
    AND login_time < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes sessions (plus de 30 jours)
CREATE OR REPLACE FUNCTION clean_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM member_sessions 
  WHERE login_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Programmer le nettoyage automatique des sessions zombies (si pg_cron est disponible)
-- SELECT cron.schedule('clean-zombie-sessions', '0 */6 * * *', 'SELECT clean_zombie_sessions();');
-- SELECT cron.schedule('clean-old-sessions', '0 2 * * 0', 'SELECT clean_old_sessions();');

-- Trigger pour fermer automatiquement les sessions lors de la suppression d'un utilisateur
CREATE OR REPLACE FUNCTION close_user_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE member_sessions 
  SET logout_time = NOW(), 
      is_active = false 
  WHERE user_id = OLD.id 
    AND is_active = true;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur la table auth.users (si accessible)
-- CREATE TRIGGER trigger_close_user_sessions
--   BEFORE DELETE ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION close_user_sessions(); 