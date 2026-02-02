#!/bin/bash

# ================================
# Script de déploiement Cloud Run
# Application Gestion Association
# ================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE_NAME="association-app"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Fonction d'aide
show_help() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}Déploiement Cloud Run - Association${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project     ID du projet GCP (requis)"
    echo "  -r, --region      Région GCP (défaut: europe-west1)"
    echo "  -s, --service     Nom du service (défaut: association-app)"
    echo "  -h, --help        Afficher cette aide"
    echo ""
    echo "Variables d'environnement:"
    echo "  GCP_PROJECT_ID    ID du projet GCP"
    echo "  GCP_REGION        Région GCP"
    echo ""
    echo "Exemple:"
    echo "  ./deploy.sh -p mon-projet-gcp -r europe-west1"
    echo ""
}

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier le projet
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Erreur: PROJECT_ID requis${NC}"
    echo "Utilisez -p/--project ou définissez GCP_PROJECT_ID"
    exit 1
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Configuration du déploiement${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Projet:  ${GREEN}${PROJECT_ID}${NC}"
echo -e "Région:  ${GREEN}${REGION}${NC}"
echo -e "Service: ${GREEN}${SERVICE_NAME}${NC}"
echo -e "Image:   ${GREEN}${IMAGE_NAME}${NC}"
echo ""

# Vérifier gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Erreur: gcloud CLI non installé${NC}"
    echo "Installez-le depuis: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configurer le projet
echo -e "${YELLOW}[1/5] Configuration du projet GCP...${NC}"
gcloud config set project $PROJECT_ID

# Activer les APIs nécessaires
echo -e "${YELLOW}[2/5] Activation des APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    --quiet

# Construire l'image
echo -e "${YELLOW}[3/5] Construction de l'image Docker...${NC}"
gcloud builds submit --tag $IMAGE_NAME:latest .

# Déployer sur Cloud Run
echo -e "${YELLOW}[4/5] Déploiement sur Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300

# Récupérer l'URL
echo -e "${YELLOW}[5/5] Récupération de l'URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Déploiement réussi !${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "URL du service: ${BLUE}${SERVICE_URL}${NC}"
echo ""
echo "Routes disponibles:"
echo -e "  - Landing page:  ${SERVICE_URL}/"
echo -e "  - Page Ramadan:  ${SERVICE_URL}/ramadan"
echo -e "  - Application:   ${SERVICE_URL}/app"
echo -e "  - API Health:    ${SERVICE_URL}/api/health"
echo ""
echo -e "${YELLOW}Note: N'oubliez pas de configurer les variables d'environnement${NC}"
echo -e "${YELLOW}pour la base de données dans la console Cloud Run.${NC}"
echo ""
