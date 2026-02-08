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
# module: api
# ==========================================================================================

variable "api_definition" {
  type        = string
  description = "(Required) Path to the API Gateway definition JSON file (relative to the Terraform root module directory)"
}

variable "throttling_burst_limit" {
  type = number
  description = "(Optional) The API Gateway stage throttling burst limit"
  default = 500
}

variable "throttling_rate_limit" {
  type = number
  description = "(Optional) The API Gateway stage throttling rate limit"
  default = 1000
}

# ==========================================================================================
# module: db
# ==========================================================================================

variable "blog_table_max_read_request_units" {
  type        = number
  description = "(Required) Maximum number of strongly consistent reads consumed per second for the main table before DynamoDB returns a ThrottlingException."
}

variable "blog_table_max_write_request_units" {
  type        = number
  description = "(Required) Maximum number of writes consumed per second for the main table before DynamoDB returns a ThrottlingException."
}

variable "tag_ref_table_max_read_request_units" {
  type        = number
  description = "(Required) Maximum number of strongly consistent reads consumed per second for the tag reference table before DynamoDB returns a ThrottlingException."
}

variable "tag_ref_table_max_write_request_units" {
  type        = number
  description = "(Required) Maximum number of writes consumed per second for the tag reference table before DynamoDB returns a ThrottlingException."
}

# ==========================================================================================
# module: cdn
# ==========================================================================================

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