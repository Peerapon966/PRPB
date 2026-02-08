# ==========================================================================================
# Global Variables
# ==========================================================================================

project                       = "prpb"
region                        = "ap-southeast-1"
is_production                 = true
environment                   = "prod"

# ==========================================================================================
# module: api
# ==========================================================================================

api_definition = "assets/api/api.json"

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
hosted_zone_name    = "prpblog.com"
