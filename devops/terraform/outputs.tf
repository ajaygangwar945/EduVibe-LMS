output "ec2_public_ip" {
  description = "The public IP address of your EduVibe AWS EC2 server"
  value       = aws_instance.eduvibe_server.public_ip
}

output "ssh_command" {
  description = "Command to SSH into your EC2 server"
  value       = "ssh ubuntu@${aws_instance.eduvibe_server.public_ip}"
}

output "frontend_url" {
  description = "Public URL to access the EduVibe React Web Portal"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:3005"
}

output "backend_api_url" {
  description = "Public URL for Node.js API"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:5000"
}

output "mongo_express_url" {
  description = "Public URL for MongoDB Visual Web Explorer"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:8081"
}

output "jenkins_url" {
  description = "Public URL for Jenkins CI/CD Dashboard"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:8080"
}

output "s3_bucket_name" {
  description = "Amazon S3 Bucket created for PDF & Video storage"
  value       = aws_s3_bucket.eduvibe_storage.bucket
}

output "cloudfront_cdn_domain" {
  description = "Amazon CloudFront high-speed CDN URL for streaming videos and PDFs"
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}

output "ecr_frontend_repository" {
  description = "Amazon ECR Repository for React container images"
  value       = aws_ecr_repository.frontend_repo.repository_url
}

output "ecr_backend_repository" {
  description = "Amazon ECR Repository for Node.js API container images"
  value       = aws_ecr_repository.backend_repo.repository_url
}
