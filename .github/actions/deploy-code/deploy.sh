#!/bin/bash

set -e

pushd terraform > /dev/null 2>&1
IS_PRODUCTION=$(awk -F' = ' '/^is_production/ {print $NF}' $TFVARS_FILE | tr -d '"')
S3_ORIGIN_BUCKET_NAME=$(terraform output -raw s3_origin_bucket_name)
CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw distribution_id)
API_KEY=$(aws apigateway get-api-key --api-key $(terraform output -raw api_key_id) --include-value --query 'value' --output text)
popd > /dev/null 2>&1

if [[ "$IS_PRODUCTION" != "true" ]]; then
  # Run DynamoDB seeder
  pushd dynamodb > /dev/null 2>&1
  bash seeder.sh -k $API_KEY
  popd > /dev/null 2>&1
fi

aws s3 sync dist/ "s3://$S3_ORIGIN_BUCKET_NAME/" --delete
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"

echo "Deployment complete!"
