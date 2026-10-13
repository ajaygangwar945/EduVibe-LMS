# CloudWatch Alarm: Alerts if EC2 CPU Utilization exceeds 80% for 5 minutes
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_alarm" {
  alarm_name          = "${var.project_name}-high-cpu-utilization"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggered when EC2 CPU utilization exceeds 80% for 10 minutes"
  alarm_actions       = [aws_sns_topic.eduvibe_alerts.arn]

  dimensions = {
    InstanceId = aws_instance.eduvibe_server.id
  }

  tags = {
    Name = "${var.project_name}-cpu-alarm"
  }
}
