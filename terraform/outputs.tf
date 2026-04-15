output "s3_origin_bucket_name" {
  description = "S3 origin bucket name"
  value       = module.s3.s3_origin_bucket.bucket
}

output "app_domain_name" {
  description = "Application domain name"
  value       = module.cdn.app_domain_name
}

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cdn.distribution_id
}
