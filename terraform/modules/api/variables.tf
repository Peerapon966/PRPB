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

variable "dynamodb_blog_table" {
  type = object({
    name = string
    arn  = string
  })
  description = "DynamoDB blog table attributes"
}

variable "dynamodb_tag_ref_table" {
  type = object({
    name = string
    arn  = string
  })
  description = "DynamoDB tag reference table attributes"
}

variable "api_definition_path" {
  type        = string
  description = "(Optional) Path to the API Gateway definition JSON file (relative to the Terraform root module directory)"
  default     = "assets/api/api.json.tftpl"
}

variable "throttling_burst_limit" {
  type        = number
  description = "(Optional) The API Gateway stage throttling burst limit"
  default     = 500
}

variable "throttling_rate_limit" {
  type        = number
  description = "(Optional) The API Gateway stage throttling rate limit"
  default     = 1000
}
