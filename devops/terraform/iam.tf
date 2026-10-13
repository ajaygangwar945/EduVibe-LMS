# IAM Role for EC2 Instance
resource "aws_iam_role" "eduvibe_ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach Amazon S3 Access Policy
resource "aws_iam_policy" "eduvibe_s3_policy" {
  name        = "${var.project_name}-s3-policy"
  description = "Allows EC2 instance to upload and read PDFs/videos from S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          "${aws_s3_bucket.eduvibe_storage.arn}",
          "${aws_s3_bucket.eduvibe_storage.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3" {
  role       = aws_iam_role.eduvibe_ec2_role.name
  policy_arn = aws_iam_policy.eduvibe_s3_policy.arn
}

# Attach Amazon ECR Container Registry Access Policy (Read & Write)
resource "aws_iam_role_policy_attachment" "attach_ecr" {
  role       = aws_iam_role.eduvibe_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

# Attach CloudWatch Server Policy for Metrics
resource "aws_iam_role_policy_attachment" "attach_cloudwatch" {
  role       = aws_iam_role.eduvibe_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance Profile to attach the Role to EC2
resource "aws_iam_instance_profile" "eduvibe_instance_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.eduvibe_ec2_role.name
}
