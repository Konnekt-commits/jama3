# Déploiement Cloud Run - Application Gestion Association

## Prérequis

1. **Google Cloud SDK** installé et configuré
   ```bash
   # Installation: https://cloud.google.com/sdk/docs/install
   gcloud auth login
   ```

2. **Projet GCP** créé avec facturation activée

3. **Base de données Cloud SQL** (optionnel mais recommandé)

---

## Déploiement Rapide

### Option 1: Script automatique

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Déployer
./deploy.sh -p VOTRE_PROJECT_ID -r europe-west1
```

### Option 2: Commandes manuelles

```bash
# Définir le projet
export PROJECT_ID="votre-project-id"
export REGION="europe-west1"

# Configurer gcloud
gcloud config set project $PROJECT_ID

# Activer les APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Construire et déployer
gcloud builds submit --tag gcr.io/$PROJECT_ID/association-app .

gcloud run deploy association-app \
  --image gcr.io/$PROJECT_ID/association-app \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

---

## Configuration des Variables d'Environnement

### Via Console GCP

1. Aller sur [Cloud Run Console](https://console.cloud.google.com/run)
2. Sélectionner le service `association-app`
3. Cliquer sur "Modifier et déployer une nouvelle révision"
4. Onglet "Variables et secrets"
5. Ajouter les variables:

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Environnement |
| `DB_HOST` | `/cloudsql/PROJECT:REGION:INSTANCE` | Connexion Cloud SQL |
| `DB_USER` | `association_user` | Utilisateur DB |
| `DB_PASSWORD` | `***` | Mot de passe DB (utiliser Secret Manager) |
| `DB_NAME` | `association_db` | Nom de la base |
| `JWT_SECRET` | `***` | Secret JWT (utiliser Secret Manager) |
| `JWT_EXPIRES_IN` | `7d` | Expiration JWT |
| `CORS_ORIGIN` | `https://votre-domaine.com` | Origine CORS |

### Via Secret Manager (Recommandé pour les secrets)

```bash
# Créer un secret
echo -n "votre_mot_de_passe" | gcloud secrets create db-password --data-file=-

# Accorder l'accès au service account de Cloud Run
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Référencer dans Cloud Run
gcloud run services update association-app \
  --set-secrets="DB_PASSWORD=db-password:latest"
```

---

## Configuration Cloud SQL

### Créer une instance

```bash
# Créer l'instance MySQL
gcloud sql instances create association-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --root-password=ROOT_PASSWORD

# Créer la base de données
gcloud sql databases create association_db --instance=association-db

# Créer un utilisateur
gcloud sql users create association_user \
  --instance=association-db \
  --password=USER_PASSWORD
```

### Connecter Cloud Run à Cloud SQL

```bash
gcloud run services update association-app \
  --add-cloudsql-instances=PROJECT_ID:REGION:association-db \
  --set-env-vars="DB_HOST=/cloudsql/PROJECT_ID:REGION:association-db"
```

---

## Structure des URLs

Une fois déployé, les routes disponibles sont:

| URL | Description |
|-----|-------------|
| `/` | Landing page principale |
| `/ramadan` | Page calendrier Ramadan |
| `/app` | Application de gestion (SPA) |
| `/api/health` | Health check API |
| `/api/*` | Endpoints API |

---

## Test Local avec Docker

```bash
# Construire et lancer
docker-compose up --build

# Accéder à l'application
open http://localhost:8080
```

---

## CI/CD avec Cloud Build

Le fichier `cloudbuild.yaml` est configuré pour un déploiement automatique.

### Configurer un trigger

1. Aller sur [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Créer un nouveau trigger
3. Connecter votre repository GitHub/GitLab
4. Configurer pour utiliser `cloudbuild.yaml`

---

## Domaine Personnalisé

```bash
# Mapper un domaine
gcloud run domain-mappings create \
  --service association-app \
  --domain votre-domaine.com \
  --region $REGION
```

Puis configurer les DNS selon les instructions affichées.

---

## Monitoring

- **Logs**: `gcloud logging read "resource.type=cloud_run_revision"`
- **Métriques**: Console GCP > Cloud Run > Métriques
- **Alertes**: Console GCP > Monitoring > Alertes

---

## Coûts Estimés

- **Cloud Run**: ~$0 pour faible trafic (free tier)
- **Cloud SQL (db-f1-micro)**: ~$7-10/mois
- **Container Registry**: ~$0.026/GB stockage

Pour réduire les coûts:
- Utilisez `--min-instances 0` pour scale-to-zero
- Cloud SQL: utilisez des instances partagées ou Serverless
