# ==========================================================================================
# Global variables
# ==========================================================================================

variable "project" {
  type        = string
  description = "(Required) Name of the project"
}

variable "region" {
  type        = string
  description = "(Required) AWS region to deploy the resources"

  validation {
    condition     = can(regex("(af|ap|ca|eu|me|sa|us)-(central|north|(north(?:east|west))|south|south(?:east|west)|east|west)-\\d+", var.region))
    error_message = "Invalid AWS region. See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html for more details."
  }
}

variable "account" {
  type        = string
  description = "(Required) ID of the AWS account to deploy the resources"

  validation {
    condition     = can(regex("^\\d{12}$", var.account))
    error_message = "Invalid AWS account ID."
  }
}

variable "environment" {
  type        = string
  description = "(Required) Name of the environment"
}

variable "is_production" {
  type        = bool
  description = "(Optional) Flag to determine if the environment is production or not"
  default     = false
}

variable "profile" {
  type        = string
  description = "(Optional) AWS CLI profile to use for authentication"
  default     = null
}

# ==========================================================================================
# module: cdn
# ==========================================================================================

variable "s3_bucket_cache_behavior" {
  type = object({
    cloudfront_cache_policy_name            = string
    cloudfront_origin_request_policy_name   = optional(string)
    cloudfront_response_headers_policy_name = optional(string)
  })
  description = "(Required) Cache behavior for the S3 origin bucket."

  validation {
    condition     = var.s3_bucket_cache_behavior.cloudfront_origin_request_policy_name != "Managed-AllViewer"
    error_message = "S3 expects the origin's host and cannot resolve the distribution's host."
  }
}

variable "supabase_api_origin" {
  type = object({
    origin_domain = string
    origin_path = string
    origin_name = string
    custom_headers = optional(map(string), {})
  })
  description = "(Required) Origin details for Supabase PostgREST API."
}

variable "supabase_api_cache_behavior" {
  type = object({
    cloudfront_cache_policy_name            = string
    cloudfront_origin_request_policy_name   = optional(string)
    cloudfront_response_headers_policy_name = optional(string)
  })
  description = "(Required) Cache behavior for Supabase PostgREST API."
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
