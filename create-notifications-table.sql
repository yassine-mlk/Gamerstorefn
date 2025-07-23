-- ===========================================
-- Script de création de la table des notifications
-- ===========================================

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Utilisateur destinataire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Contenu de la notification
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_updated', 'general')),
    
    -- Données supplémentaires (JSON)
    data JSONB,
    
    -- Statut de lecture
    read BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Commentaires
COMMENT ON TABLE notifications IS 'Table des notifications utilisateur';
COMMENT ON COLUMN notifications.user_id IS 'ID de l''utilisateur destinataire';
COMMENT ON COLUMN notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN notifications.message IS 'Message de la notification';
COMMENT ON COLUMN notifications.type IS 'Type de notification (task_assigned, task_completed, task_updated, general)';
COMMENT ON COLUMN notifications.data IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN notifications.read IS 'Indique si la notification a été lue';

-- Vue pour les statistiques des notifications
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN read = FALSE THEN 1 END) as unread_count,
    COUNT(CASE WHEN read = TRUE THEN 1 END) as read_count,
    COUNT(CASE WHEN type = 'task_assigned' THEN 1 END) as task_assigned_count,
    COUNT(CASE WHEN type = 'task_completed' THEN 1 END) as task_completed_count,
    COUNT(CASE WHEN type = 'task_updated' THEN 1 END) as task_updated_count,
    COUNT(CASE WHEN type = 'general' THEN 1 END) as general_count,
    MAX(created_at) as last_notification_date
FROM notifications
GROUP BY user_id;

COMMENT ON VIEW notification_stats IS 'Statistiques des notifications par utilisateur';

-- Politique RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de notifications (par les admins ou le système)
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Fonction pour nettoyer les anciennes notifications (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND read = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_notifications IS 'Nettoie les anciennes notifications lues (par défaut 30 jours)'; 