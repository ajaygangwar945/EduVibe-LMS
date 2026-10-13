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
