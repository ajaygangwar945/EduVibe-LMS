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
