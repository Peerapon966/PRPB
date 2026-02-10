terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.31.0"
    }
    template = {
      source  = "hashicorp/template"
      version = "~> 2.2.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.13.0"
    }
  }

  backend "s3" {}
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

provider "aws" {
  alias   = "virginia"
  region  = "us-east-1"
  profile = var.profile
}
