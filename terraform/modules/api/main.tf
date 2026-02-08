data "aws_iam_policy_document" "api_gateway_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "api_execution_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["dynamodb:*"]
    resources = [
      var.dynamodb_blog_table.arn,
      var.dynamodb_tag_ref_table.arn,
      "${var.dynamodb_blog_table.arn}/*",
      "${var.dynamodb_tag_ref_table.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "api_execution_role_policy" {
  name   = "${var.global_variables.prefix}-api-execution-policy"
  policy = data.aws_iam_policy_document.api_execution_role_policy.json
}

resource "aws_iam_role" "api_execution_role" {
  name               = "${var.global_variables.prefix}-api-execution-role"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assume_role.json
}

resource "aws_iam_role_policy_attachment" "api_execution_role_attachment" {
  role       = aws_iam_role.api_execution_role.name
  policy_arn = aws_iam_policy.api_execution_role_policy.arn
}

resource "aws_api_gateway_rest_api" "api" {
  name              = "${var.global_variables.prefix}-api"
  put_rest_api_mode = "merge"
  body              = file(join("", [path.root, startswith(var.api_definition, "/") ? "${var.api_definition}" : "/${var.api_definition}"]))

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.api_execution_role_attachment
  ]
}

resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on  = [aws_api_gateway_rest_api.api]
  rest_api_id = aws_api_gateway_rest_api.api.id
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "api_access_log" {
  name              = "API-Gateway-Access-Logs_${aws_api_gateway_rest_api.api.id}/${var.global_variables.environment}"
  log_group_class   = "STANDARD"
  retention_in_days = 30
}

resource "aws_api_gateway_stage" "api_stage" {
  depends_on    = [aws_api_gateway_deployment.api_deployment, aws_cloudwatch_log_group.api_access_log]
  stage_name    = var.global_variables.environment
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  variables = {
    "dynamoDBMainTableName"   = var.dynamodb_blog_table.name
    "dynamoDBTagRefTableName" = var.dynamodb_tag_ref_table.name
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_access_log.arn
    format          = "$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime]\"$context.httpMethod $context.resourcePath $context.protocol\" $context.status $context.error.responseType $context.responseLength $context.requestId $context.extendedRequestId"
  }
}

resource "aws_api_gateway_method_settings" "api_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = aws_api_gateway_stage.api_stage.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
    data_trace_enabled = var.global_variables.is_production ? false : true
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }
}


resource "aws_api_gateway_api_key" "api_key" {
  name = "${var.global_variables.prefix}-api-key"
}

resource "aws_api_gateway_usage_plan" "api_usage_plan" {
  name        = "${var.global_variables.prefix}-usage-plan"
  description = "API Usage Plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.api.id
    stage  = aws_api_gateway_stage.api_stage.stage_name
  }

  throttle_settings {
    burst_limit = 50
    rate_limit  = 100
  }
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.api_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.api_usage_plan.id
}
