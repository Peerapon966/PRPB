#!/bin/bash
set -eo pipefail

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a,--auto-approve-terraform)
      AUTO_APPROVE_TF=true
      shift 1
      ;;
    -t,--deploy-terraform)
      DEPLOY_TF=true
      shift 1
      ;;
    *)
      ;;
  esac
done

pushd $(dirname -- ${BASH_SOURCE[0]})
pushd ../terraform

aws sts get-caller-identity --profile dev || { echo "Couldn't authenticate AWS profile 'dev'"; exit 1; }

terraform init -backend-config=init/backend-dev.hcl

ORIGIN_BUCKET_NAME=$(terraform output -raw s3_origin_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw distribution_id)
if [[ ${DEPLOY_TF} == true ]]; then
  terraform apply -var-file=tfvars/development.tfvars "${AUTO_APPROVE_TF:+-auto-approve}"
fi

pushd ..

npm run build -- --mode development

aws s3 sync dist/ "s3://${ORIGIN_BUCKET_NAME}" --delete --exclude "assets/*" --profile dev
aws s3 sync src/assets/ "s3://${ORIGIN_BUCKET_NAME}/assets" --delete --profile dev
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --profile dev | tee /dev/null
