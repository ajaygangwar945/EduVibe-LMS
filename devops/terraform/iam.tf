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

# Attach AWS Systems Manager policy (AWS Best Practice for secure EC2 management)
resource "aws_iam_role_policy_attachment" "attach_ssm" {
  role       = aws_iam_role.eduvibe_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance Profile to attach the Role to EC2
resource "aws_iam_instance_profile" "eduvibe_instance_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.eduvibe_ec2_role.name
}
