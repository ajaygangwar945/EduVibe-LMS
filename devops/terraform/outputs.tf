output "ec2_public_ip" {
  description = "The public IP address of your EduVibe AWS EC2 server"
  value       = aws_instance.eduvibe_server.public_ip
}

output "ssh_command" {
  description = "Command to SSH into your EC2 server"
  value       = "ssh -i ~/.ssh/webserver.pem ubuntu@${aws_instance.eduvibe_server.public_ip}"
}

output "frontend_url" {
  description = "Public URL to access the EduVibe React Web Portal"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:3005"
}

output "backend_api_url" {
  description = "Public URL for Node.js API"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:5000"
}

output "backend_health_url" {
  description = "Public URL for Node.js API Healthcheck"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:5000/api/health"
}

output "prometheus_url" {
  description = "Public URL for Prometheus Metrics Server"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:9090"
}

output "grafana_url" {
  description = "Public URL for Grafana Real-Time Dashboard"
  value       = "http://${aws_instance.eduvibe_server.public_ip}:3001"
}
