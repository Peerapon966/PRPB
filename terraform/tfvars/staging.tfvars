# ==========================================================================================
# Global Variables
# ==========================================================================================

project       = "prpb"
is_production = false
environment   = "staging"

# ==========================================================================================
# module: cdn
# ==========================================================================================

s3_bucket_cache_behavior = {
  cloudfront_cache_policy_name = "Managed-CachingOptimized"
}
hosted_zone_name    = "p-dev.click"
app_sub_domain_name = "staging"
