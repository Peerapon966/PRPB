locals {
  global_variables = {
    region        = "${var.region}"
    account       = "${var.account}"
    is_production = var.is_production
    prefix        = "${var.project}-${var.environment}"
    environment   = "${var.environment}"
  }
}

module "s3" {
  source           = "./modules/s3"
  global_variables = local.global_variables
}

module "cdn" {
  source = "./modules/cdn"
  providers = {
    aws.virginia = aws.virginia
  }
  global_variables                    = local.global_variables
  s3_origin_bucket                    = module.s3.s3_origin_bucket
  s3_bucket_cache_behavior            = var.s3_bucket_cache_behavior
  supabase_api_origin                 = var.supabase_api_origin
  supabase_api_cache_behavior         = var.supabase_api_cache_behavior
  add_index_cf_function_source_code   = var.add_index_cf_function_source_code
  remove_path_cf_function_source_code = var.remove_path_cf_function_source_code
  hosted_zone_name                    = var.hosted_zone_name
  app_sub_domain_name                 = var.app_sub_domain_name
}
