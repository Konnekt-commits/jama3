const pool = require('../../config/db');

// GET /api/school/topics - Liste des thèmes disponibles
exports.getAll = async (req, res) => {
    try {
        const associationId = req.associationId;

        // Get both default topics (association_id IS NULL) and custom topics for this association
        const [topics] = await pool.execute(`
            SELECT * FROM school_topics
            WHERE association_id IS NULL OR association_id = ?
            ORDER BY sort_order, name_fr
        `, [associationId]);

        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des thèmes'
        });
    }
};

// GET /api/school/topics/by-category - Thèmes groupés par catégorie
exports.getByCategory = async (req, res) => {
    try {
        const associationId = req.associationId;

        const [topics] = await pool.execute(`
            SELECT * FROM school_topics
            WHERE association_id IS NULL OR association_id = ?
            ORDER BY category, sort_order, name_fr
        `, [associationId]);

        // Group by category
        const grouped = {
            langue: [],
            religion: [],
            activite: [],
            autre: []
        };

        topics.forEach(t => {
            if (grouped[t.category]) {
                grouped[t.category].push(t);
            } else {
                grouped.autre.push(t);
            }
        });

        res.json({
            success: true,
            data: grouped
        });
    } catch (error) {
        console.error('Get topics by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des thèmes'
        });
    }
};

// POST /api/school/topics - Créer un thème personnalisé
exports.create = async (req, res) => {
    try {
        const associationId = req.associationId;
        const { name_fr, name_ar, color, category, icon } = req.body;

        if (!name_fr) {
            return res.status(400).json({
                success: false,
                message: 'Le nom français est requis'
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO school_topics (association_id, name_fr, name_ar, color, category, icon, is_default)
            VALUES (?, ?, ?, ?, ?, ?, FALSE)
        `, [associationId, name_fr, name_ar || null, color || '#6B8E23', category || 'autre', icon || null]);

        res.json({
            success: true,
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du thème'
        });
    }
};

// DELETE /api/school/topics/:id - Supprimer un thème personnalisé
exports.delete = async (req, res) => {
    try {
        const associationId = req.associationId;
        const topicId = parseInt(req.params.id);

        // Only allow deleting custom topics (not defaults)
        const [topic] = await pool.execute(
            'SELECT * FROM school_topics WHERE id = ? AND association_id = ? AND is_default = FALSE',
            [topicId, associationId]
        );

        if (topic.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Thème non trouvé ou non supprimable'
            });
        }

        // Remove from class_topics first
        await pool.execute('DELETE FROM class_topics WHERE topic_id = ?', [topicId]);

        // Delete topic
        await pool.execute('DELETE FROM school_topics WHERE id = ?', [topicId]);

        res.json({
            success: true,
            message: 'Thème supprimé'
        });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
};

// GET /api/school/classes/:id/topics - Thèmes d'une classe
exports.getClassTopics = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

        const [topics] = await pool.execute(`
            SELECT st.* FROM school_topics st
            JOIN class_topics ct ON ct.topic_id = st.id
            WHERE ct.class_id = ?
            ORDER BY st.sort_order, st.name_fr
        `, [classId]);

        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        console.error('Get class topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des thèmes'
        });
    }
};

// PUT /api/school/classes/:id/topics - Mettre à jour les thèmes d'une classe
exports.updateClassTopics = async (req, res) => {
    try {
        const classId = parseInt(req.params.id);
        const { topic_ids } = req.body;

        if (!Array.isArray(topic_ids)) {
            return res.status(400).json({
                success: false,
                message: 'topic_ids doit être un tableau'
            });
        }

        // Remove existing topics
        await pool.execute('DELETE FROM class_topics WHERE class_id = ?', [classId]);

        // Add new topics
        for (const topicId of topic_ids) {
            await pool.execute(
                'INSERT INTO class_topics (class_id, topic_id) VALUES (?, ?)',
                [classId, topicId]
            );
        }

        res.json({
            success: true,
            message: 'Thèmes mis à jour'
        });
    } catch (error) {
        console.error('Update class topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des thèmes'
        });
    }
};
