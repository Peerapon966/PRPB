#!/bin/bash
set -eo pipefail

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a,--auto-approve)
      
      ;;
    *)
      ;;
  esac
done

pushd $(dirname -- ${BASH_SOURCE[0]})
pushd ../terraform

terraform apply -var-file=tfvars/development.tfvars -auto-approve