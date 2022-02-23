/* eslint-disable */
export const NOTIFY_THANK_YOU = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "✅ Bug Reported & Engineering Notified",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "🙌 High five! You're helping LaunchGood improve. *Thank you!*"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Your bug report has been recorded on Github and the *On-Call Engineer* has been notified. They will reach out if further details are needed and follow up once this issue has been prioritized, scheduled, and fixed."
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "<https://github.com/launchgood/launchgood/issues/3438|Github Issue #3438: Error message while trying to save profile [Bug Report from Matthew via Slack]>"
			}
		}
	]
}