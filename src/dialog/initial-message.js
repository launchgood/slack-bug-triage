/* eslint-disable */
export const INITIAL_MESSAGE = {
	"text": "Bug Report: please provide more info",
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "🐞 Bug Report Triage 🤖",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "🙏🏻 Thanks for reporting this bug! In order to help *Engineering* swiftly address this issue, I'll ask you a few more questions."
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "👉 Get Started 👈",
						"emoji": true
					},
					"action_id": "launch-triage-modal",
					"style": "primary"
				}
			]
		}
	]
};