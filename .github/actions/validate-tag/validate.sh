#!/bin/bash

set -e

validation_failed () {
  echo "Blog '$1' is categorized into non-exist category or subcategory or both. This is not allowed."
}

while read -r BLOG; do
  SLUG="${BLOG#src/pages/blog/}"
  SLUG="${SLUG%.mdx}"
  echo "Validating blog: $SLUG"

  CATEGORY=$(head -n 10 "../src/pages/blog/$SLUG.mdx" | awk -F ': ' '/^category/ {print $NF}' | tr -d '"')
  SUBCATEGORIES=$(head -n 10 "../src/pages/blog/$SLUG.mdx" | awk -F ': ' '/^subcategories/ {print $NF}')
  echo "Category: $CATEGORY"
  echo "Subcategories: $SUBCATEGORIES"

  TABLE_NAME="$(terraform output -raw tag_ref_table_name)"

  # Replace the table name in the template
  TEMPLATE=../.github/actions/validate-tag/transacItem.json
  jq --arg t $TABLE_NAME '.ConditionCheck.TableName = $t' $TEMPLATE > $TEMPLATE.tmp
  mv $TEMPLATE.tmp $TEMPLATE

  # Prepare tag validation transact items
  CATEGORY_ITEM=$(jq --arg c $CATEGORY '.ConditionCheck.Key.Category.S = "null" | .ConditionCheck.Key.Value.S = $c' $TEMPLATE)
  SUBCATEGORY_ITEMS="["

  while read -r SUBCATEGORY; do
    ITEM=$(jq --arg c "$CATEGORY" --arg s "$SUBCATEGORY" '.ConditionCheck.Key.Category.S = $c | .ConditionCheck.Key.Value.S = $s' $TEMPLATE)
    SUBCATEGORY_ITEMS+="$ITEM,"
  done < <(echo $SUBCATEGORIES | jq -r '.[]')

  SUBCATEGORY_ITEMS="${SUBCATEGORY_ITEMS%,}]"
  TRANSACT_ITEMS=$(mktemp)
  (echo $SUBCATEGORY_ITEMS | jq --argjson c "$CATEGORY_ITEM" '[$c] + .') > $TRANSACT_ITEMS

  # Execute the tag validation
  trap 'validation_failed "$SLUG"' ERR
  aws dynamodb transact-write-items \
    --transact-items file://$TRANSACT_ITEMS
  unset trap
  echo "Tag validation passed. Blog '$SLUG' is categorized into existing category and subcategories."
done < <(git diff --name-only origin/main...HEAD | grep 'src/pages/blog/.*\.mdx$' || true)
