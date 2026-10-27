#!/bin/bash
set -eo pipefail

# Deploy to the same AWS account as the assumed role
echo ""
echo "============================="
echo "|     Deploy Terraform      |"
echo "============================="
echo ""
echo "TF_WORKSPACE: $TF_WORKSPACE"
echo "TF_INIT_FILE: init/backend-${ENVIRONMENT}.hcl"
echo "TFVARS_FILE: tfvars/${ENVIRONMENT}.tfvars"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
terraform init \
  -backend-config "init/backend-${ENVIRONMENT}.hcl" \
  -reconfigure
terraform workspace select -or-create "$TF_WORKSPACE"
terraform validate
terraform apply \
  -var-file "tfvars/${ENVIRONMENT}.tfvars" \
  -var "account=$ACCOUNT_ID" \
  -auto-approve

echo ""
echo "============================="
echo "|    Deploy Application     |"
echo "============================="
echo ""
ORIGIN_BUCKET_NAME=$(terraform output -raw s3_origin_bucket_name)
aws s3 sync ../dist/ "s3://${ORIGIN_BUCKET_NAME}" --delete --cache-control "no-cache, must-revalidate" \
  --exclude "_astro/*" --exclude "blog/*" --exclude "about/*" --exclude "blogs/*" --exclude "assets/*"
aws s3 sync ../dist/_astro/ "s3://${ORIGIN_BUCKET_NAME}/_astro" --delete --cache-control "public, max-age=31536000, immutable"
aws s3 sync ../dist/blog/ "s3://${ORIGIN_BUCKET_NAME}/blog" --delete --cache-control "no-cache, must-revalidate"
aws s3 sync ../dist/about/ "s3://${ORIGIN_BUCKET_NAME}/about" --delete --cache-control "no-cache, must-revalidate"
aws s3 sync ../dist/blogs/ "s3://${ORIGIN_BUCKET_NAME}/blogs" --delete --cache-control "no-cache, must-revalidate"
aws s3 sync ../src/assets/ "s3://${ORIGIN_BUCKET_NAME}/assets" --delete --cache-control "public, max-age=604800, must-revalidate"
aws s3 sync ../data/index.json "s3://${ORIGIN_BUCKET_NAME}/data/index.json" --delete --cache-control "public, max-age=604800, must-revalidate"

echo ""
echo "============================="
echo "|     Invalidate Cache      |"
echo "============================="
echo ""
DISTRIBUTION_ID=$(terraform output -raw distribution_id)
aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"

APP_DOMAIN_NAME=$(terraform output -raw app_domain_name)
echo ""
echo "Successfully deployed to ${ENVIRONMENT} environment"
echo "Application accessible via https://${APP_DOMAIN_NAME}"
