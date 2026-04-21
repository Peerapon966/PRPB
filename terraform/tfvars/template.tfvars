# ==========================================================================================
# Global Variables
# ==========================================================================================

project       = "prpb"
region        = "ap-southeast-1"
account       = "123456789012"
environment   = "dev"
is_production = false
profile       = "default"

# ==========================================================================================
# module: cdn
# ==========================================================================================

s3_bucket_cache_behavior = {
  cloudfront_cache_policy_name = "Managed-CachingOptimized"
}
supabase_api_origin = {
  origin_domain = "xxx.supabase.co"
  origin_path   = "/rest/v1"
  origin_name   = "xxx.supabase.co"
  custom_headers = {
    apiKey = "sb_publishable_xxx_yyy_t" // Supabase publishable key
  }
}
api_gateway_cache_behavior = {
  cloudfront_cache_policy_name          = "Managed-CachingDisabled",
  cloudfront_origin_request_policy_name = "Managed-AllViewerExceptHostHeader"
}
add_index_cf_function_source_code   = "assets/cdn/addIndex.js"
remove_path_cf_function_source_code = "assets/cdn/removePath.js"
hosted_zone_name                    = "example.com"
app_sub_domain_name                 = "prpb"

