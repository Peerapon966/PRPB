variable "global_variables" {
  type = object({
    region        = string
    account       = string
    is_production = bool
    prefix        = string
    environment   = string
  })
  description = "Global variables for sharing across modules"
}

variable "s3_origin_bucket" {
  type = object({
    id                          = string
    arn                         = string
    bucket                      = string
    bucket_regional_domain_name = string
  })
  description = "S3 origin bucket attributes"
}

variable "api" {
  type = object({
    id  = string
    url = string
  })
  description = "API Gateway API attributes"
}

variable "s3_origin_cache_behavior" {
  type = object({
    cloudfront_cache_policy_name            = string
    cloudfront_origin_request_policy_name   = optional(string)
    cloudfront_response_headers_policy_name = optional(string)
  })
  description = "(Required) Cache behavior for the S3 origin bucket."

  validation {
    condition     = var.s3_origin_cache_behavior.cloudfront_origin_request_policy_name != "Managed-AllViewer"
    error_message = "S3 expects the origin's host and cannot resolve the distribution's host."
  }
}

variable "api_gateway_cache_behavior" {
  type = object({
    cloudfront_cache_policy_name            = string
    cloudfront_origin_request_policy_name   = optional(string)
    cloudfront_response_headers_policy_name = optional(string)
  })
  description = "(Required) Cache behavior for the API Gateway REST API."

  validation {
    condition     = var.api_gateway_cache_behavior.cloudfront_origin_request_policy_name != "Managed-AllViewer"
    error_message = "API Gateway expects the origin's host and cannot resolve the distribution's host."
  }
}

variable "add_index_cf_function_source_code" {
  type        = string
  description = "(Optional) Path to the [add index.html to the request URI] CloudFront function source code file (relative to the Terraform root module directory)"
  default     = "assets/cdn/addIndex.js"
}

variable "remove_path_cf_function_source_code" {
  type        = string
  description = "(Optional) Path to the [remove '/api/' from the request URI] CloudFront function source code file (relative to the Terraform root module directory)"
  default     = "assets/cdn/removePath.js"
}

variable "hosted_zone_name" {
  type        = string
  description = "(Required) The name of the hosted zone"
}

variable "app_sub_domain_name" {
  type        = string
  description = "(Optional) The sub domain name for the application"
  default     = null
}
