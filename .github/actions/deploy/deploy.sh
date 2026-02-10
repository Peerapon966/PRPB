#!/bin/bash

set -e

terraform validate
terraform apply \
  -var-file "$TFVARS_FILE" \
  -var="account=$ACCOUNT_ID" \
  -auto-approve

aws s3 sync ../dist/ "s3://$(terraform output -raw s3_origin_bucket_name)/" --delete --exclude "assets/*"
aws s3 sync ../src/assets/ "s3://$(terraform output -raw s3_origin_bucket_name)/assets/" --delete

pushd ../.github/actions/deploy > /dev/null 2>&1
while read -r BLOG; do
  SLUG="${BLOG#src/pages/blog/}"
  SLUG="${SLUG%.mdx}"
  echo "Deploying blog: $SLUG"

  METADATA=$(sed 10q "../src/pages/blog/$SLUG.mdx")
  CATEGORY=$(echo "$METADATA" | awk -F ': ' '/^category/ {print $NF}' | tr -d '"')
  SUBCATEGORIES=$(echo "$METADATA" | awk -F ': ' '/^subcategories/ {print $NF}')
  DATE=$(echo "$METADATA" | awk -F ': ' '/^date/ {print $NF}' | tr -d '"')
  TITLE=$(echo "$METADATA" | awk -F ': ' '/^title/ {print $NF}' | tr -d '"')
  DESCRIPTION=$(echo "$METADATA" | awk -F ': ' '/^description/ {print $NF}' | tr -d '"')
  THUMBNAIL="https://$(terraform output -raw app_domain_name)/assets/blog/$SLUG/thumbnail.png"

  jq \
    --arg title "$TITLE" \
    --arg description "$DESCRIPTION" \
    --arg thumbnail "$THUMBNAIL" \
    --arg slug "$SLUG" \
    --arg category "$CATEGORY" \
    --argjson subcategories "$SUBCATEGORIES" \
    --arg date "$DATE" \
    '.blogs = [{"title": $title, "description": $description, "thumbnail": $thumbnail, "slug": $slug, "category": $category, "subcategories": $subcategories, "publish_date": $date}]' \
    item.json > item.json.tmp
  mv item.json.tmp item.json

  curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d @item.json \
    "$(terraform output -raw api_invoke_url)/blogs"
done < <(git diff --name-only --diff-filter=A origin/main...HEAD | grep 'src/pages/blog/.*\.mdx$' || true)
popd > /dev/null 2>&1

aws cloudfront create-invalidation --distribution-id "$(terraform output -raw distribution_id)" --paths "/*"

echo "app-url=https://$(terraform output -raw app_domain_name)" >> "$GITHUB_OUTPUT"
echo "Terraform apply complete!"
