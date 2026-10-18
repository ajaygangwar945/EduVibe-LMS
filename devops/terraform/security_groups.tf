resource "aws_security_group" "eduvibe_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for EduVibe web app, API, Jenkins, and Monitoring"
  vpc_id      = data.aws_vpc.default.id

  # SSH remote terminal access
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  # HTTP Web Traffic
  ingress {
    description = "Standard HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Secure Web Traffic
  ingress {
    description = "Standard HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React Frontend Port
  ingress {
    description = "React Frontend Container"
    from_port   = 3005
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Node.js Express API Port
  ingress {
    description = "Node.js Express API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus Server
  ingress {
    description = "Prometheus Metrics Server"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  # Grafana Dashboard
  ingress {
    description = "Grafana Analytics Dashboard"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
  }

  # Outbound rule: Allow server to talk to internet to pull Docker images & updates
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-security-group"
  }
}
