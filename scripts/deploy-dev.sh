#!/bin/bash
set -eo pipefail

while [[ $# -gt 0 ]]; do
  case "$1" in
    # Handle combined or single short flags (e.g., -a, -t, -at, -ta)
    -*[at]*)
      if [[ "$1" == *a* ]]; then AUTO_APPROVE_TF=true; fi
      if [[ "$1" == *t* ]]; then DEPLOY_TF=true; fi
      shift 1
      ;;
    # Handle long flags
    --auto-approve-terraform)
      AUTO_APPROVE_TF=true
      shift 1
      ;;
    --deploy-terraform)
      DEPLOY_TF=true
      shift 1
      ;;
    *)
      echo "Warning: Skipping unknown argument: $1"
      shift 1
      ;;
  esac
done

# Debugging: check if they are set
echo "Auto Approve: ${AUTO_APPROVE_TF:-false}"
echo "Deploy TF: ${DEPLOY_TF:-false}"

pushd $(dirname -- ${BASH_SOURCE[0]})
pushd ../terraform

aws sts get-caller-identity --profile dev || { echo "Couldn't authenticate AWS profile 'dev'"; exit 1; }

terraform init -backend-config=init/backend-dev.hcl

ORIGIN_BUCKET_NAME=$(terraform output -raw s3_origin_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw distribution_id)
APP_DOMAIN_NAME=$(terraform output -raw app_domain_name)
if [[ ${DEPLOY_TF} == true ]]; then
  terraform apply -var-file=tfvars/development.tfvars "${AUTO_APPROVE_TF:+-auto-approve}"
fi

pushd ..

npm run build -- --mode development

aws s3 sync dist/ "s3://${ORIGIN_BUCKET_NAME}" --delete --exclude "assets/*" --profile dev
aws s3 sync src/assets/ "s3://${ORIGIN_BUCKET_NAME}/assets" --delete --cache-control "public, max-age=604800, must-revalidate" --profile dev
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --profile dev | tee /dev/null

echo ""
echo "Successfully deployed to development environment"
echo "Application accessible via https://${APP_DOMAIN_NAME}"