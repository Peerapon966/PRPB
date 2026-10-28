# ==========================================================================================
# Global Variables
# ==========================================================================================

project       = "prpb"
region        = "ap-southeast-1"
account       = "741448960615"
is_production = false
environment   = "dev"
profile       = "dev"

# ==========================================================================================
# module: cdn
# ==========================================================================================

s3_bucket_cache_behavior = {
  cloudfront_cache_policy_name = "Managed-CachingOptimized"
}
hosted_zone_name    = "p-dev.click"
app_sub_domain_name = "dev"
