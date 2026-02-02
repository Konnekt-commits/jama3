// Service de traduction Français/Arabe

const translations = {
    fr: {
        // General
        appName: 'Gestion Mosquée',
        loading: 'Chargement...',
        save: 'Enregistrer',
        cancel: 'Annuler',
        close: 'Fermer',
        edit: 'Modifier',
        delete: 'Supprimer',
        add: 'Ajouter',
        search: 'Rechercher...',
        noResults: 'Aucun résultat',
        confirm: 'Confirmer',

        // Navigation
        nav: {
            dashboard: 'Tableau de bord',
            adherents: 'Adhérents',
            cotisations: 'Cotisations',
            agenda: 'Agenda',
            intervenants: 'Intervenants',
            messages: 'Messages'
        },

        // Login
        login: {
            title: 'Gestion Mosquée',
            subtitle: 'Connectez-vous pour accéder au tableau de bord',
            email: 'Email',
            password: 'Mot de passe',
            submit: 'Se connecter',
            loading: 'Connexion...',
            error: 'Identifiants incorrects',
            noAccount: 'Pas encore de compte ?',
            register: 'Créer un compte',
            demo: 'Compte de démonstration :',
            bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
        },

        // Dashboard
        dashboard: {
            welcome: 'Bonjour !',
            activeMembers: 'Adhérents actifs',
            collectedFees: 'Cotisations perçues',
            eventsThisMonth: 'Événements ce mois',
            collectionRate: 'Taux de recouvrement',
            upcomingEvents: 'Prochains événements',
            quickActions: 'Actions rapides',
            overdueFees: 'Cotisations en retard',
            viewAll: 'Voir tout',
            newMember: 'Nouvel adhérent',
            newEvent: 'Nouvel événement',
            sendMessage: 'Envoyer message',
            noEvents: 'Aucun événement à venir',
            noOverdue: 'Aucun retard de paiement'
        },

        // Adherents
        adherents: {
            title: 'Adhérents',
            all: 'Tous',
            active: 'Actifs',
            inactive: 'Inactifs',
            archived: 'Archivés',
            search: 'Rechercher un adhérent...',
            count: '{count} adhérent(s)',
            new: 'Nouvel adhérent',
            edit: 'Modifier l\'adhérent',
            firstName: 'Prénom',
            lastName: 'Nom',
            email: 'Email',
            phone: 'Téléphone',
            birthDate: 'Date de naissance',
            address: 'Adresse',
            postalCode: 'Code postal',
            city: 'Ville',
            status: 'Statut',
            memberNumber: 'N° adhérent',
            noMembers: 'Aucun adhérent',
            startAdding: 'Commencez par ajouter votre premier adhérent',
            addFirst: 'Ajouter un adhérent'
        },

        // Status
        status: {
            actif: 'Actif',
            inactif: 'Inactif',
            suspendu: 'Suspendu',
            archive: 'Archivé'
        },

        // Sidebar
        sidebar: {
            logout: 'Déconnexion',
            admin: 'Administrateur',
            collapse: 'Réduire le menu'
        },

        // Navbar
        navbar: {
            search: 'Rechercher...',
            theme: 'Changer de thème',
            notifications: 'Notifications',
            language: 'Changer de langue'
        },

        // Messages
        messages: {
            created: 'Créé avec succès',
            updated: 'Modifié avec succès',
            deleted: 'Supprimé avec succès',
            error: 'Une erreur est survenue',
            sessionExpired: 'Session expirée'
        }
    },

    ar: {
        // General
        appName: 'إدارة المسجد',
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        close: 'إغلاق',
        edit: 'تعديل',
        delete: 'حذف',
        add: 'إضافة',
        search: 'بحث...',
        noResults: 'لا توجد نتائج',
        confirm: 'تأكيد',

        // Navigation
        nav: {
            dashboard: 'لوحة التحكم',
            adherents: 'الأعضاء',
            cotisations: 'الاشتراكات',
            agenda: 'الأجندة',
            intervenants: 'المتدخلون',
            messages: 'الرسائل'
        },

        // Login
        login: {
            title: 'إدارة المسجد',
            subtitle: 'سجّل دخولك للوصول إلى لوحة التحكم',
            email: 'البريد الإلكتروني',
            password: 'كلمة المرور',
            submit: 'تسجيل الدخول',
            loading: 'جاري التحميل...',
            error: 'بيانات الدخول غير صحيحة',
            noAccount: 'ليس لديك حساب؟',
            register: 'إنشاء حساب',
            demo: 'حساب تجريبي :',
            bismillah: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
        },

        // Dashboard
        dashboard: {
            welcome: 'مرحباً!',
            activeMembers: 'الأعضاء النشطون',
            collectedFees: 'الاشتراكات المحصلة',
            eventsThisMonth: 'أحداث هذا الشهر',
            collectionRate: 'نسبة التحصيل',
            upcomingEvents: 'الأحداث القادمة',
            quickActions: 'إجراءات سريعة',
            overdueFees: 'الاشتراكات المتأخرة',
            viewAll: 'عرض الكل',
            newMember: 'عضو جديد',
            newEvent: 'حدث جديد',
            sendMessage: 'إرسال رسالة',
            noEvents: 'لا توجد أحداث قادمة',
            noOverdue: 'لا توجد مدفوعات متأخرة'
        },

        // Adherents
        adherents: {
            title: 'الأعضاء',
            all: 'الكل',
            active: 'النشطون',
            inactive: 'غير النشطين',
            archived: 'المؤرشفون',
            search: 'البحث عن عضو...',
            count: '{count} عضو',
            new: 'عضو جديد',
            edit: 'تعديل العضو',
            firstName: 'الاسم الأول',
            lastName: 'اسم العائلة',
            email: 'البريد الإلكتروني',
            phone: 'الهاتف',
            birthDate: 'تاريخ الميلاد',
            address: 'العنوان',
            postalCode: 'الرمز البريدي',
            city: 'المدينة',
            status: 'الحالة',
            memberNumber: 'رقم العضوية',
            noMembers: 'لا يوجد أعضاء',
            startAdding: 'ابدأ بإضافة أول عضو',
            addFirst: 'إضافة عضو'
        },

        // Status
        status: {
            actif: 'نشط',
            inactif: 'غير نشط',
            suspendu: 'موقوف',
            archive: 'مؤرشف'
        },

        // Sidebar
        sidebar: {
            logout: 'تسجيل الخروج',
            admin: 'مدير',
            collapse: 'تصغير القائمة'
        },

        // Navbar
        navbar: {
            search: 'بحث...',
            theme: 'تغيير المظهر',
            notifications: 'الإشعارات',
            language: 'تغيير اللغة'
        },

        // Messages
        messages: {
            created: 'تم الإنشاء بنجاح',
            updated: 'تم التعديل بنجاح',
            deleted: 'تم الحذف بنجاح',
            error: 'حدث خطأ',
            sessionExpired: 'انتهت الجلسة'
        }
    }
};

class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'fr';
        this.listeners = [];
    }

    get lang() {
        return this.currentLang;
    }

    set lang(newLang) {
        if (newLang === 'fr' || newLang === 'ar') {
            this.currentLang = newLang;
            localStorage.setItem('lang', newLang);
            document.documentElement.setAttribute('data-lang', newLang);
            document.documentElement.setAttribute('lang', newLang);

            // Update title
            document.title = this.t('appName');

            // Notify listeners
            this.listeners.forEach(cb => cb(newLang));
        }
    }

    toggleLang() {
        this.lang = this.currentLang === 'fr' ? 'ar' : 'fr';
        return this.currentLang;
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback to French
                value = translations.fr;
                for (const fk of keys) {
                    if (value && value[fk] !== undefined) {
                        value = value[fk];
                    } else {
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }

        // Replace params like {count}
        if (typeof value === 'string') {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }

        return value;
    }

    onLangChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    isArabic() {
        return this.currentLang === 'ar';
    }

    isFrench() {
        return this.currentLang === 'fr';
    }
}

const i18n = new I18nService();
export default i18n;
