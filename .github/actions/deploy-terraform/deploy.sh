#!/bin/bash

set -e

ENV=$(awk -F' = ' '/^environment/ {print $NF}' $TFVARS_FILE | tr -d '"')
API_DEFINITION=$(awk -F' = ' '/^api_definition/ {print $NF}' $TFVARS_FILE | tr -d '"')
IS_PRODUCTION=$(awk -F' = ' '/^is_production/ {print $NF}' $TFVARS_FILE | tr -d '"')

export TF_VAR_account="$ACCOUNT_ID"

# replace all placeholders in the api.json with the actual values
sed -i "s|<execution_role_arn>|arn:aws:iam::$ACCOUNT_ID:role/$WORKSPACE-api-execution-role|g" $API_DEFINITION
sed -i "s|<env>|$ENV|g" $API_DEFINITION
sed -i "s|<title>|$TITLE-api|g" $API_DEFINITION
terraform validate
terraform apply \
  -var-file "$TFVARS_FILE" \
  -auto-approve

echo "app-url=https://$(terraform output -raw app_domain_name)" >> "$GITHUB_OUTPUT"
echo "Terraform apply complete!"
