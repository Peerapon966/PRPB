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

variable "point_in_time_recovery_days" {
  type        = number
  description = "(Optional) The number of days to retain point-in-time recovery data for the DynamoDB table."
  default     = 14
}