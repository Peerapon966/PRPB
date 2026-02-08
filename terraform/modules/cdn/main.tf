terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.84.0"
      configuration_aliases = [aws.virginia]
    }
  }
}

# ==========================================================================================
# ACM Certificate
# ==========================================================================================

data "aws_route53_zone" "hosted_zone" {
  name = "${var.hosted_zone_name}."
}

locals {
  app_domain_name = var.app_sub_domain_name != null ? "${var.app_sub_domain_name}.${var.hosted_zone_name}" : var.hosted_zone_name
}

resource "aws_acm_certificate" "cloudfront_cert" {
  provider                  = aws.virginia
  domain_name               = local.app_domain_name
  subject_alternative_names = ["www.${local.app_domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cloudfront_cert_validation" {
  depends_on = [aws_acm_certificate.cloudfront_cert]
  for_each = {
    for option in aws_acm_certificate.cloudfront_cert.domain_validation_options : option.domain_name => {
      name  = option.resource_record_name
      value = option.resource_record_value
      type  = option.resource_record_type
    }
  }

  allow_overwrite = true
  zone_id         = data.aws_route53_zone.hosted_zone.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 300
  records         = [each.value.value]
}


# ==========================================================================================
# CloudFront Distribution
# ==========================================================================================

locals {
  cloudfront_origins = {
    s3_origin_bucket      = var.s3_origin_cache_behavior,
    api_gateway           = var.api_gateway_cache_behavior
  }
}

data "aws_cloudfront_cache_policy" "cache_policy" {
  for_each = { for k, v in local.cloudfront_origins : k => v.cloudfront_cache_policy_name }
  name     = each.value
}

data "aws_cloudfront_origin_request_policy" "origin_request_policy" {
  for_each = { for k, v in local.cloudfront_origins : k => v.cloudfront_origin_request_policy_name if trimspace(try(coalesce(v.cloudfront_origin_request_policy_name), "")) != "" }
  name     = each.value
}

data "aws_cloudfront_response_headers_policy" "response_header_policy" {
  for_each = { for k, v in local.cloudfront_origins : k => v.cloudfront_response_headers_policy_name if trimspace(try(coalesce(v.cloudfront_response_headers_policy_name), "")) != "" }
  name     = each.value
}

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.global_variables.prefix}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "no-override"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "add_index_cf_function" {
  name    = "${var.global_variables.prefix}-add-index-function"
  runtime = "cloudfront-js-2.0"
  comment = "Add index.html at the end of incoming viewer request URI"
  publish = true
  code    = file(join("", [path.root, startswith(var.add_index_cf_function_source_code, "/") ? "${var.add_index_cf_function_source_code}" : "/${var.add_index_cf_function_source_code}"]))

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_function" "remove_path_cf_function" {
  name    = "${var.global_variables.prefix}-remove-path-function"
  runtime = "cloudfront-js-2.0"
  comment = "Remove '/api/ or /assets/' part from the incoming viewer request URI"
  publish = true
  code    = file(join("", [path.root, startswith(var.remove_path_cf_function_source_code, "/") ? "${var.remove_path_cf_function_source_code}" : "/${var.remove_path_cf_function_source_code}"]))

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [local.app_domain_name, "www.${local.app_domain_name}"]

  origin {
    domain_name              = var.s3_origin_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    origin_id                = var.s3_origin_bucket.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy     = "redirect-to-https"
    target_origin_id           = var.s3_origin_bucket.id
    cache_policy_id            = data.aws_cloudfront_cache_policy.cache_policy["s3_origin_bucket"].id
    origin_request_policy_id   = trimspace(try(coalesce(var.s3_origin_cache_behavior.cloudfront_origin_request_policy_name), "")) != "" ? data.aws_cloudfront_origin_request_policy.origin_request_policy["s3_origin_bucket"].id : null
    response_headers_policy_id = trimspace(try(coalesce(var.s3_origin_cache_behavior.cloudfront_response_headers_policy_name), "")) != "" ? data.aws_cloudfront_response_headers_policy.response_header_policy["s3_origin_bucket"].id : null

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.add_index_cf_function.arn
    }
  }

  origin {
    domain_name = trimprefix(trimsuffix(var.api.url, "/${var.global_variables.environment}"), "https://")
    origin_id   = var.api.id
    origin_path = "/${var.global_variables.environment}"

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/api/*"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy     = "redirect-to-https"
    target_origin_id           = var.api.id
    cache_policy_id            = data.aws_cloudfront_cache_policy.cache_policy["api_gateway"].id
    origin_request_policy_id   = trimspace(try(coalesce(var.api_gateway_cache_behavior.cloudfront_origin_request_policy_name), "")) != "" ? data.aws_cloudfront_origin_request_policy.origin_request_policy["api_gateway"].id : null
    response_headers_policy_id = trimspace(try(coalesce(var.api_gateway_cache_behavior.cloudfront_response_headers_policy_name), "")) != "" ? data.aws_cloudfront_response_headers_policy.response_header_policy["api_gateway"].id : null

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.remove_path_cf_function.arn
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# ==========================================================================================
# CloudFront OAC
# ==========================================================================================

data "aws_iam_policy_document" "allow_public_access" {
  policy_id = "PolicyForCloudFrontPrivateContent"

  statement {
    sid     = "AllowCloudFrontServicePrincipal"
    effect  = "Allow"
    actions = ["s3:GetObject"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    resources = ["${var.s3_origin_bucket.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["${var.s3_origin_bucket.arn}"]

    principals {
      type        = "AWS"
      identifiers = [var.global_variables.account]
    }
  }
}

resource "aws_s3_bucket_policy" "origin_bucket_policy" {
  bucket   = var.s3_origin_bucket.id
  policy   = data.aws_iam_policy_document.allow_public_access.json
}

# ==========================================================================================
# Route53 Alias Record
# ==========================================================================================

resource "aws_route53_record" "prpb_record" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = local.app_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_prpb_record" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = var.app_sub_domain_name != null ? "www.${var.app_sub_domain_name}" : "www"
  type    = "CNAME"
  ttl     = 300
  records = [local.app_domain_name]
}
