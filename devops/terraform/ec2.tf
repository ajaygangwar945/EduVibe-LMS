# EC2 Instance for EduVibe (Ubuntu 22.04 LTS)
resource "aws_instance" "eduvibe_server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  key_name             = var.key_name != "" ? var.key_name : null
  subnet_id            = element(data.aws_subnets.default.ids, 0)
  vpc_security_group_ids = [aws_security_group.eduvibe_sg.id]
  iam_instance_profile = aws_iam_instance_profile.eduvibe_instance_profile.name

  # Execute automated Docker & tools installation on initial boot
  user_data = file("${path.module}/user_data.sh")

  # 20 GB gp3 volume (30 GB is 100% Free Tier on AWS!)
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "${var.project_name}-cloud-server"
  }
}
