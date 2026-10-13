# Amazon SNS Topic for System & Approval Notifications
resource "aws_sns_topic" "eduvibe_alerts" {
  name = "${var.project_name}-alerts-topic"

  tags = {
    Name = "${var.project_name}-sns"
  }
}

# Optional Email Subscription (Free tier includes 1,000 email alerts/month)
resource "aws_sns_topic_subscription" "email_sub" {
  topic_arn = aws_sns_topic.eduvibe_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
