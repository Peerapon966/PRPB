# ==========================================================================================
# Global Variables
# ==========================================================================================

project       = "prpb"
region        = "ap-southeast-1"
is_production = false
environment   = "staging"

# ==========================================================================================
# module: cdn
# ==========================================================================================

s3_origin_cache_behavior = {
  cloudfront_cache_policy_name = "Managed-CachingOptimized"
}
supabase_api_origin = {
  origin_domain = "xsoubwmlxtaetnuupdjq.supabase.co"
  origin_path   = "/rest/v1"
  origin_name   = "xsoubwmlxtaetnuupdjq.supabase.co"
  custom_headers = {
    apiKey = "sb_publishable_y7lwogOpVfX20uah84eGYA_urwCW4_t" // Supabase publishable key
  }
}
api_gateway_cache_behavior = {
  cloudfront_cache_policy_name          = "Managed-CachingDisabled",
  cloudfront_origin_request_policy_name = "Managed-AllViewerExceptHostHeader"
}
hosted_zone_name    = "p-dev.click"
app_sub_domain_name = "staging"
