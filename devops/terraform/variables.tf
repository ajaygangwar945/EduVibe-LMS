variable "aws_region" {
  description = "The AWS Region where all resources will be created"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name tag prefix for all resources"
  type        = string
  default     = "eduvibe"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "EC2 instance size. t2.micro or t3.micro is 100% Free-Tier eligible. t3.small gives 2GB RAM for extra speed."
  type        = string
  default     = "t2.micro"
}

variable "admin_cidr_blocks" {
  description = "Allowed CIDR IP ranges for administrative interfaces (SSH, Prometheus, Grafana). Set to your IP (e.g. ['203.0.113.50/32']) in production."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "key_name" {
  description = "AWS Key Pair name for SSH access (default: webserver)"
  type        = string
  default     = "webserver"
}
