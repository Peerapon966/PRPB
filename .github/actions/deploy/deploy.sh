#!/bin/bash
set -e

echo "GITHUB_EVENT_NAME: $GITHUB_EVENT_NAME"

if [[ "${GITHUB_EVENT_NAME}" = 'pull_request' ]]; then
  GITHUB_BASE_REF_SHA=$(cat $GITHUB_EVENT_PATH | jq -r '.pull_request.base.sha')
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"
  git tag -f last-base-ref-sha $GITHUB_BASE_REF_SHA
  git push -f origin last-base-ref-sha
elif [[ "${GITHUB_EVENT_NAME}" = 'workflow_dispatch' ]]; then
  GITHUB_BASE_REF_SHA=${BASE_REF_SHA:-$(git rev-parse last-base-ref-sha)}
fi
echo "GITHUB_BASE_REF_SHA: $GITHUB_BASE_REF_SHA"

NEW_BLOG_COUNT=0
if [[ "${GITHUB_BASE_REF_SHA}" != 'null' ]]; then
  NEW_BLOG_COUNT=$(git diff --name-only --diff-filter=A $GITHUB_BASE_REF_SHA...HEAD | (grep 'src/pages/blog/.*\.mdx$' || true) | wc -l)
fi
echo "NEW_BLOG_COUNT: $NEW_BLOG_COUNT"

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

if [[ $NEW_BLOG_COUNT -gt 0 ]]; then
  echo "========== BLOGS =========="
  git diff --name-only --diff-filter=A $GITHUB_BASE_REF_SHA...HEAD | grep 'src/pages/blog/.*\.mdx$'
  echo "========== BLOGS =========="
  while read -r BLOG; do
    SLUG="${BLOG#src/pages/blog/}"
    SLUG="${SLUG%.mdx}"
    echo "Registering blog to DB: $SLUG"

    METADATA=$(sed 10q "../src/pages/blog/$SLUG.mdx")
    TITLE=$(echo "$METADATA" | awk -F ': ' '/^title/ {print $NF}' | tr -d '"')
    DESCRIPTION=$(echo "$METADATA" | awk -F ': ' '/^description/ {print $NF}' | tr -d '"')
    SLUG=$(echo "$METADATA" | awk -F ': ' '/^slug/ {print $NF}' | tr -d '"')
    AUTHOR=$(echo "$METADATA" | awk -F ': ' '/^author/ {print $NF}' | tr -d '"')
    PUBLISH_DATE=$(echo "$METADATA" | awk -F ': ' '/^date/ {print $NF}' | tr -d '"')
    TAGS=$(echo "$METADATA" | awk -F ': ' '/^tags/ {print $NF}' | tr '"' "\'")
    echo "TITLE: ${TITLE}"
    echo "DESCRIPTION: ${DESCRIPTION}"
    echo "SLUG: ${SLUG}"
    echo "AUTHOR: ${AUTHOR}"
    echo "PUBLISH_DATE: ${PUBLISH_DATE}"
    echo "TAGS: ${TAGS}"

    psql "${DB_CONNECTION_STRING}" \
      -c "
        CALL insert_blog(
          p_title => '${TITLE}',
          p_description => '${DESCRIPTION}',
          p_slug => '${SLUG}',
          p_author => '${AUTHOR}',
          p_publish_date => '${PUBLISH_DATE}'::DATE,
          p_tags => ARRAY${TAGS}
        );

        REFRESH MATERIALIZED VIEW blogs_with_tags;
      "
  done < <(git diff --name-only --diff-filter=A $GITHUB_BASE_REF_SHA...HEAD | grep 'src/pages/blog/.*\.mdx$')
fi

cat $GITHUB_EVENT_PATH
# DISTRIBUTION_ID=$(terraform output -raw distribution_id)
# aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"

# APP_DOMAIN_NAME=$(terraform output -raw app_domain_name)
# echo ""
# echo "Successfully deployed to ${ENVIRONMENT} environment"
# echo "Application accessible via https://${APP_DOMAIN_NAME}"
