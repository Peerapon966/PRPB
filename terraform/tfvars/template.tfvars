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
# module: api
# ==========================================================================================

api_definition_path    = "assets/api/api.json.tftpl"
throttling_burst_limit = 250
throttling_rate_limit  = 500

# ==========================================================================================
# module: db
# ==========================================================================================

blog_table_max_read_request_units     = 5
blog_table_max_write_request_units    = 5
tag_ref_table_max_read_request_units  = 5
tag_ref_table_max_write_request_units = 5

# ==========================================================================================
# module: cdn
# ==========================================================================================

s3_origin_cache_behavior = {
  cloudfront_cache_policy_name = "Managed-CachingOptimized"
}
api_gateway_cache_behavior = {
  cloudfront_cache_policy_name          = "Managed-CachingDisabled",
  cloudfront_origin_request_policy_name = "Managed-AllViewerExceptHostHeader"
}
add_index_cf_function_source_code   = "assets/cdn/addIndex.js"
remove_path_cf_function_source_code = "assets/cdn/removePath.js"
hosted_zone_name                    = "example.com"
app_sub_domain_name                 = "prpb"

