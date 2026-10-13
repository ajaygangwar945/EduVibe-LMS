# Unique suffix to prevent global S3 bucket name collision
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Amazon S3 Bucket for PDFs and Lecture Videos
resource "aws_s3_bucket" "eduvibe_storage" {
  bucket        = "${var.project_name}-storage-${random_id.bucket_suffix.hex}"
  force_destroy = true # Allows easy teardown with 'terraform destroy'

  tags = {
    Name = "${var.project_name}-media-bucket"
  }
}

# Block public access by default (secure)
resource "aws_s3_bucket_public_access_block" "eduvibe_storage_block" {
  bucket = aws_s3_bucket.eduvibe_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-Side Encryption at rest (AES-256)
resource "aws_s3_bucket_server_side_encryption_configuration" "eduvibe_storage_encryption" {
  bucket = aws_s3_bucket.eduvibe_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket versioning to protect against accidental deletion or corruption
resource "aws_s3_bucket_versioning" "eduvibe_storage_versioning" {
  bucket = aws_s3_bucket.eduvibe_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Control (OAC) Policy: Allows CloudFront distribution to securely read objects
data "aws_iam_policy_document" "s3_cloudfront_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.eduvibe_storage.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "eduvibe_storage_policy" {
  bucket = aws_s3_bucket.eduvibe_storage.id
  policy = data.aws_iam_policy_document.s3_cloudfront_policy.json
}

# CORS Configuration so React and HTML5 video player can load files
resource "aws_s3_bucket_cors_configuration" "eduvibe_storage_cors" {
  bucket = aws_s3_bucket.eduvibe_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
