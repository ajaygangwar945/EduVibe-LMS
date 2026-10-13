# CloudFront Origin Access Control (OAC) to securely read from private S3 bucket
resource "aws_cloudfront_origin_access_control" "eduvibe_oac" {
  name                              = "${var.project_name}-oac"
  description                       = "Origin Access Control for EduVibe S3 Media Bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront CDN Distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.eduvibe_storage.bucket_regional_domain_name
    origin_id                = "EduVibeS3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.eduvibe_oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "EduVibe CDN for streaming videos and downloading lecture PDFs"
  default_root_object = ""

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "EduVibeS3Origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100" # Lowest cost / 100% Free Tier (1 TB transfer out free/mo)

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cdn"
  }
}
