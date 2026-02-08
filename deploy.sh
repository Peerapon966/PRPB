#!/bin/bash

set -e

cleanup () {
  mv assets/api/api.json.bak assets/api/api.json
  popd > /dev/null 2>&1
}

deploy_code () {
  npm run build
  aws s3 sync ../dist/ "s3://$(terraform output -raw s3_origin_bucket_name)" --delete --profile $1
  aws cloudfront create-invalidation --distribution-id "$(terraform output -raw distribution_id)" --profile $1 --paths "/*"
}

WORKSPACE="default"
while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--option)
      OPTION="$2"
      if [[ "$OPTION" != "deploy" && "$OPTION" != "destroy" && "$OPTION" != "update" ]]; then
        echo "Invalid option: $OPTION"
        echo "Valid options are 'deploy', 'destroy', and 'update'"
        exit 1
      fi
      shift 2
      ;;    
    -f|--tfvars-file)
      if [[ ! -f "$2" ]]; then
        echo "Error: tfvars file not found at $2"
        exit 1
      fi

      TFVARS_FILE=$(mktemp)
      cat "$2" > "$TFVARS_FILE"
      shift 2
      ;;
    -b|--remote-bucket)
      REMOTE_BUCKET="$2"
      shift 2
      ;;
    -t|--remote-table)
      REMOTE_TABLE="$2"
      shift 2
      ;;
    -w|--workspace)
      WORKSPACE="$2"
      shift 2
      ;;
    -h|--help)
      echo "-o, --option          ... (Required) Specify the action to perform (valid options are are 'deploy', 'destroy', and 'update')"
      echo "-f, --tfvars-file     ... (Required) Specify the path to the tfvars file"
      echo "-b, --remote-bucket   ... (Required) Remote bucket to use for Terraform state"
      echo "-t, --remote-table    ... (Required) Remote table to use for Terraform state"
      echo "-w, --workspace       ... (Optional) Specify the Terraform workspace to use"
      echo "-h, --help            ... Show this message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$REMOTE_BUCKET" || -z "$REMOTE_TABLE" ]]; then
  echo "Error: Remote bucket and table must be specified."
  exit 1
fi

if [[ -z "$OPTION" ]]; then
  echo "Error: Option must be specified."
  exit 1
fi

trap cleanup ERR
pushd terraform > /dev/null 2>&1

PROJECT=$(awk -F' = ' '/^project/ {print $NF}' $TFVARS_FILE | tr -d '"')
REGION=$(awk -F' = ' '/^region/ {print $NF}' $TFVARS_FILE | tr -d '"')
ACCOUNT=$(awk -F' = ' '/^account/ {print $NF}' $TFVARS_FILE | tr -d '"')
ENV=$(awk -F' = ' '/^environment/ {print $NF}' $TFVARS_FILE | tr -d '"')
BRANCH=$(awk -F' = ' '/^branch/ {print $NF}' $TFVARS_FILE | tr '\[/*\]' '-' | tr -d '"')
PROFILE=$(awk -F' = ' '/^profile/ {print $NF}' $TFVARS_FILE | tr -d '"')
INCLUDE_BRANCH=$(awk -F' = ' '/^include_branch_name_in_prefix/ {print $NF}' $TFVARS_FILE | tr -d '"')

if [[ $INCLUDE_BRANCH == "true" ]]; then
  if [[ -z "$BRANCH" ]]; then
    echo "Error: Branch name must be specified when include_branch_name_in_prefix is true."
    exit 1
  fi
  PREFIX="$PROJECT-$ENV-$BRANCH"
else
  PREFIX="$PROJECT-$ENV"
fi

terraform init \
  -backend-config "bucket=$REMOTE_BUCKET" \
  -backend-config "dynamodb_table=$REMOTE_TABLE" \
  -backend-config "key=terraform.tfstate" \
  -backend-config "region=$REGION" \
  -backend-config "profile=$PROFILE" \
  -reconfigure

[[ "$(aws apigateway get-account --profile $PROFILE | jq -r '.cloudwatchRoleArn')" == null ]] && \
  export TF_VAR_enable_account_logging="true" || \
  export TF_VAR_enable_account_logging="false"

if ! terraform workspace list | grep -q "$WORKSPACE"; then
  terraform workspace new "$WORKSPACE"
else
  terraform workspace select "$WORKSPACE"
fi

cp assets/api/api.json assets/api/api.json.bak
sed -i "s|<execution_role_arn>|arn:aws:iam::$ACCOUNT:role/$PREFIX-api-execution-role|g" assets/api/api.json

if [[ $OPTION == "deploy" ]]; then
  echo "Deploying Terraform..."
  terraform apply \
    -var-file "$TFVARS_FILE"
  echo "Deploying code..."
  deploy_code $PROFILE
  echo "Deployment complete!"
elif [[ $OPTION == "destroy" ]]; then
  echo "Destroying Terraform..."
  terraform destroy \
    -var-file "$TFVARS_FILE"
  echo "Deleting workspace..."
  terraform workspace select default
  terraform workspace delete "$WORKSPACE"
elif [[ $OPTION == "update" ]]; then
  echo "Updating code..."
  deploy_code $PROFILE
  echo "Deployment complete!"
else
  echo "Invalid option: $OPTION"
  exit 1
fi

rm -f assets/api/api.json
mv assets/api/api.json.bak assets/api/api.json

popd > /dev/null 2>&1