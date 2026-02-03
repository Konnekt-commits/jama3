const AssociationModel = require('../../models/association.model');
const UserModel = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Créer une nouvelle association (Onboarding)
exports.create = async (req, res) => {
    try {
        const {
            // Association data
            association_name,
            description,
            email: association_email,
            phone,
            address,
            city,
            postal_code,
            // Owner data
            owner_email,
            owner_password,
            owner_first_name,
            owner_last_name
        } = req.body;

        // Validation
        if (!association_name || !owner_email || !owner_password || !owner_first_name || !owner_last_name) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes pour la création de l\'association'
            });
        }

        // Générer un slug unique
        const slug = await AssociationModel.generateUniqueSlug(association_name);

        // Créer l'association
        const associationId = await AssociationModel.create({
            name: association_name,
            slug,
            description,
            email: association_email,
            phone,
            address,
            city,
            postal_code
        });

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(owner_password, 10);

        // Créer l'utilisateur owner/admin
        const userId = await UserModel.create({
            association_id: associationId,
            email: owner_email,
            password: hashedPassword,
            role: 'admin',
            first_name: owner_first_name,
            last_name: owner_last_name,
            is_owner: true
        });

        // Générer le token JWT
        const token = jwt.sign(
            {
                userId,
                associationId,
                role: 'admin',
                isOwner: true
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Récupérer l'association créée
        const association = await AssociationModel.findById(associationId);

        res.status(201).json({
            success: true,
            message: 'Association créée avec succès',
            data: {
                association: {
                    id: association.id,
                    name: association.name,
                    slug: association.slug
                },
                user: {
                    id: userId,
                    email: owner_email,
                    first_name: owner_first_name,
                    last_name: owner_last_name,
                    role: 'admin'
                },
                token
            }
        });
    } catch (error) {
        console.error('Erreur création association:', error);

        // Check for duplicate email
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'association'
        });
    }
};

// Récupérer les infos de l'association courante
exports.getCurrent = async (req, res) => {
    try {
        const association = await AssociationModel.findById(req.associationId);

        if (!association) {
            return res.status(404).json({
                success: false,
                message: 'Association non trouvée'
            });
        }

        res.json({
            success: true,
            data: association
        });
    } catch (error) {
        console.error('Erreur récupération association:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'association'
        });
    }
};

// Mettre à jour l'association courante
exports.update = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin ou owner
        if (req.userRole !== 'admin' && !req.isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Permission refusée'
            });
        }

        const updated = await AssociationModel.update(req.associationId, req.body);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'Aucune modification effectuée'
            });
        }

        const association = await AssociationModel.findById(req.associationId);

        res.json({
            success: true,
            message: 'Association mise à jour',
            data: association
        });
    } catch (error) {
        console.error('Erreur mise à jour association:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
};

// Statistiques de l'association
exports.getStats = async (req, res) => {
    try {
        const stats = await AssociationModel.getStats(req.associationId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur récupération stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};

// Vérifier la disponibilité d'un slug
exports.checkSlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const exists = await AssociationModel.slugExists(slug);

        res.json({
            success: true,
            available: !exists
        });
    } catch (error) {
        console.error('Erreur vérification slug:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
    }
};
