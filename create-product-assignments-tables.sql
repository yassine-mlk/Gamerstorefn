-- ===========================================
-- Script de création des tables pour l'assignation de produits aux équipes
-- ===========================================

-- Table des assignations de produits
CREATE TABLE IF NOT EXISTS product_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Information sur le produit
    product_id TEXT NOT NULL, -- ID du produit (peut être timestamp)
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('pc_portable', 'pc_gamer', 'moniteur', 'chaise_gaming', 'peripherique', 'composant_pc')),
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100), -- Code-barres ou référence
    product_etat VARCHAR(20), -- État du produit (Neuf, Comme neuf, Occasion)
    
    -- Assignation
    assigned_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to_name VARCHAR(255) NOT NULL,
    assigned_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by_name VARCHAR(255),
    
    -- Détails de la tâche
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_notes TEXT,
    priority VARCHAR(20) DEFAULT 'moyenne' CHECK (priority IN ('basse', 'moyenne', 'haute', 'urgente')),
    
    -- Statut et dates
    status VARCHAR(50) DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'terminee', 'validee', 'annulee')),
    due_date DATE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    validated_date TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_dates CHECK (
        (started_date IS NULL OR started_date >= assigned_date) AND
        (completed_date IS NULL OR (started_date IS NOT NULL AND completed_date >= started_date)) AND
        (validated_date IS NULL OR (completed_date IS NOT NULL AND validated_date >= completed_date))
    )
);

-- Table pour les commentaires/notes sur les assignations
CREATE TABLE IF NOT EXISTS assignment_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES product_assignments(id) ON DELETE CASCADE,
    
    -- Auteur du commentaire
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    
    -- Contenu
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'note' CHECK (comment_type IN ('note', 'update', 'completion', 'issue')),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_assignments_assigned_to ON product_assignments(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_product_assignments_assigned_by ON product_assignments(assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_product_assignments_product ON product_assignments(product_id, product_type);
CREATE INDEX IF NOT EXISTS idx_product_assignments_status ON product_assignments(status);
CREATE INDEX IF NOT EXISTS idx_product_assignments_priority ON product_assignments(priority);
CREATE INDEX IF NOT EXISTS idx_product_assignments_dates ON product_assignments(assigned_date, due_date);

CREATE INDEX IF NOT EXISTS idx_assignment_comments_assignment ON assignment_comments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_comments_author ON assignment_comments(author_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_product_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_product_assignments_updated_at
    BEFORE UPDATE ON product_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_product_assignments_updated_at();

CREATE TRIGGER trigger_update_assignment_comments_updated_at
    BEFORE UPDATE ON assignment_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_product_assignments_updated_at();

-- Fonction pour mettre à jour automatiquement les dates de statut
CREATE OR REPLACE FUNCTION update_assignment_status_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour started_date quand le statut passe à 'en_cours'
    IF NEW.status = 'en_cours' AND OLD.status != 'en_cours' AND NEW.started_date IS NULL THEN
        NEW.started_date = NOW();
    END IF;
    
    -- Mettre à jour completed_date quand le statut passe à 'terminee'
    IF NEW.status = 'terminee' AND OLD.status != 'terminee' AND NEW.completed_date IS NULL THEN
        NEW.completed_date = NOW();
    END IF;
    
    -- Mettre à jour validated_date quand le statut passe à 'validee'
    IF NEW.status = 'validee' AND OLD.status != 'validee' AND NEW.validated_date IS NULL THEN
        NEW.validated_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les dates de statut
CREATE TRIGGER trigger_update_assignment_status_dates
    BEFORE UPDATE ON product_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_assignment_status_dates();

-- Politiques RLS (Row Level Security) pour Supabase
ALTER TABLE product_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_comments ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON product_assignments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permettre toutes les opérations pour les utilisateurs authentifiés" ON assignment_comments
    FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires sur les tables
COMMENT ON TABLE product_assignments IS 'Assignations de produits aux membres d''équipe comme tâches';
COMMENT ON TABLE assignment_comments IS 'Commentaires et notes sur les assignations de produits';

COMMENT ON COLUMN product_assignments.product_id IS 'ID du produit assigné (peut être timestamp ou UUID)';
COMMENT ON COLUMN product_assignments.product_type IS 'Type de produit (pc_portable, moniteur, etc.)';
COMMENT ON COLUMN product_assignments.task_title IS 'Titre de la tâche à effectuer';
COMMENT ON COLUMN product_assignments.priority IS 'Priorité de la tâche (basse, moyenne, haute, urgente)';
COMMENT ON COLUMN product_assignments.status IS 'Statut de l''assignation';

-- Vues utiles pour les statistiques
CREATE OR REPLACE VIEW assignment_stats AS
SELECT 
    assigned_to_id,
    assigned_to_name,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'en_attente' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'en_cours' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'terminee' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'validee' THEN 1 END) as validated_count,
    COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('terminee', 'validee') THEN 1 END) as overdue_count
FROM product_assignments
GROUP BY assigned_to_id, assigned_to_name;

COMMENT ON VIEW assignment_stats IS 'Statistiques des assignations par membre d''équipe';

-- Vue pour les assignations récentes
CREATE OR REPLACE VIEW recent_assignments AS
SELECT 
    pa.*,
    ac.comment_count
FROM product_assignments pa
LEFT JOIN (
    SELECT 
        assignment_id,
        COUNT(*) as comment_count
    FROM assignment_comments
    GROUP BY assignment_id
) ac ON pa.id = ac.assignment_id
ORDER BY pa.created_at DESC
LIMIT 50;

COMMENT ON VIEW recent_assignments IS 'Les 50 assignations les plus récentes avec nombre de commentaires'; 