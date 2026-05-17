resource "aws_security_group" "test_vuln_sg" {
  name        = "test_vuln_sg"
  description = "Intentional vulnerability for Snyk testing"
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_policy" "test_vuln_policy" {
  name        = "test_vuln_policy"
  description = "Intentional vulnerability for Snyk testing"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "*"
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}