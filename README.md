# PRPB

Source code for my weblog [prpblog.com](https://prpblog.com)

```sh
npm ci
bash deploy.sh \
  -o deploy \
  -f terraform/tfvars/prod.tfvars \
  -b <remote-state-bucket-name> \
  -t <remote-state-table-name>
```
