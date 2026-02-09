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

module "db" {
  source                                = "./modules/db"
  global_variables                      = local.global_variables
  blog_table_max_read_request_units     = var.blog_table_max_read_request_units
  blog_table_max_write_request_units    = var.blog_table_max_write_request_units
  tag_ref_table_max_read_request_units  = var.tag_ref_table_max_read_request_units
  tag_ref_table_max_write_request_units = var.tag_ref_table_max_write_request_units
}

module "api" {
  source                 = "./modules/api"
  global_variables       = local.global_variables
  api_definition_path    = var.api_definition_path
  dynamodb_blog_table    = module.db.dynamodb_blog_table
  dynamodb_tag_ref_table = module.db.dynamodb_tag_ref_table
  throttling_burst_limit = var.throttling_burst_limit
  throttling_rate_limit  = var.throttling_rate_limit
}

module "cdn" {
  source = "./modules/cdn"
  providers = {
    aws.virginia = aws.virginia
  }
  global_variables                    = local.global_variables
  s3_origin_bucket                    = module.s3.s3_origin_bucket
  api                                 = module.api.api
  s3_origin_cache_behavior            = var.s3_origin_cache_behavior
  api_gateway_cache_behavior          = var.api_gateway_cache_behavior
  add_index_cf_function_source_code   = var.add_index_cf_function_source_code
  remove_path_cf_function_source_code = var.remove_path_cf_function_source_code
  hosted_zone_name                    = var.hosted_zone_name
  app_sub_domain_name                 = var.app_sub_domain_name
}
