#!/bin/bash
set -e

echo "GITHUB_EVENT_PATH: $GITHUB_EVENT_PATH"
echo "GITHUB_EVENT_NAME: $GITHUB_EVENT_NAME"
GITHUB_BASE_REF_SHA=$(cat $GITHUB_EVENT_PATH | jq -r '.pull_request.base.sha')
if [[ "${GITHUB_EVENT_NAME}" = 'closed' ]]; then
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"
  git tag -f last-base-ref-sha $GITHUB_BASE_REF_SHA
  git push -f origin last-base-ref-sha
elif [[ "${GITHUB_EVENT_NAME}" = 'workflow_dispatch' ]]; then
  GITHUB_BASE_REF_SHA=$(git rev-parse last-base-ref-sha)
fi

echo "GITHUB_BASE_REF_SHA: $GITHUB_BASE_REF_SHA"
if [[ "${GITHUB_BASE_REF_SHA}" != 'null' ]]; then
  git diff --name-only --diff-filter=A $GITHUB_BASE_REF_SHA...HEAD | grep 'src/pages/blog/.*\.mdx$'
fi

cat $GITHUB_EVENT_PATH

# Deploy to the same AWS account as the assumed role
# ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# terraform init \
#   -backend-config "bucket=$S3_BUCKET_NAME" \
#   -backend-config "dynamodb_table=$DYNAMODB_TABLE_NAME" \
#   -backend-config "region=$REGION" \
#   -backend-config "key=terraform.tfstate" \
#   -reconfigure
# terraform workspace select -or-create "$WORKSPACE"
# terraform validate
# terraform apply \
#   -var-file "$TFVARS_FILE" \
#   -var="account=$ACCOUNT_ID" \
#   -auto-approve

# ORIGIN_BUCKET_NAME=$(terraform output -raw s3_origin_bucket_name)
# aws s3 sync ../dist/ "s3://${ORIGIN_BUCKET_NAME}" --delete --cache-control "no-cache, must-revalidate" \
#   --exclude "_astro/*" --exclude "blog/*" --exclude "about/*" --exclude "blogs/*" --exclude "assets/*"
# aws s3 sync ../dist/_astro/ "s3://${ORIGIN_BUCKET_NAME}/_astro" --delete --cache-control "public, max-age=31536000, immutable"
# aws s3 sync ../dist/blog/ "s3://${ORIGIN_BUCKET_NAME}/blog" --delete --cache-control "no-cache, must-revalidate"
# aws s3 sync ../dist/about/ "s3://${ORIGIN_BUCKET_NAME}/about" --delete --cache-control "no-cache, must-revalidate"
# aws s3 sync ../dist/blogs/ "s3://${ORIGIN_BUCKET_NAME}/blogs" --delete --cache-control "no-cache, must-revalidate"
# aws s3 sync ../src/assets/ "s3://${ORIGIN_BUCKET_NAME}/assets" --delete --cache-control "public, max-age=604800, must-revalidate"

# while read -r BLOG; do
#   SLUG="${BLOG#src/pages/blog/}"
#   SLUG="${SLUG%.mdx}"
#   echo "Deploying blog: $SLUG"

#   METADATA=$(sed 10q "../src/pages/blog/$SLUG.mdx")
#   CATEGORY=$(echo "$METADATA" | awk -F ': ' '/^category/ {print $NF}' | tr -d '"')
#   SUBCATEGORIES=$(echo "$METADATA" | awk -F ': ' '/^subcategories/ {print $NF}')
#   DATE=$(echo "$METADATA" | awk -F ': ' '/^date/ {print $NF}' | tr -d '"')
#   TITLE=$(echo "$METADATA" | awk -F ': ' '/^title/ {print $NF}' | tr -d '"')
#   DESCRIPTION=$(echo "$METADATA" | awk -F ': ' '/^description/ {print $NF}' | tr -d '"')
#   THUMBNAIL="https://$(terraform output -raw app_domain_name)/assets/blog/$SLUG/thumbnail.png"

#   jq \
#     --arg title "$TITLE" \
#     --arg description "$DESCRIPTION" \
#     --arg thumbnail "$THUMBNAIL" \
#     --arg slug "$SLUG" \
#     --arg category "$CATEGORY" \
#     --argjson subcategories "$SUBCATEGORIES" \
#     --arg date "$DATE" \
#     '.blogs = [{"title": $title, "description": $description, "thumbnail": $thumbnail, "slug": $slug, "category": $category, "subcategories": $subcategories, "publish_date": $date}]' \
#     item.json > item.json.tmp
#   mv item.json.tmp item.json

#   curl \
#     -X POST \
#     -H "Content-Type: application/json" \
#     -H "X-API-Key: $API_KEY" \
#     -d @item.json \
#     "$(terraform output -raw api_invoke_url)/blogs"
# done < <(git diff --name-only --diff-filter=A origin/main...HEAD | grep 'src/pages/blog/.*\.mdx$' || true)

# DISTRIBUTION_ID=$(terraform output -raw distribution_id)
# aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"

# APP_DOMAIN_NAME=$(terraform output -raw app_domain_name)
# echo ""
# echo "Successfully deployed to ${ENVIRONMENT} environment"
# echo "Application accessible via https://${APP_DOMAIN_NAME}"
