/* eslint-disable */
export const SELECT_OS_MOBILE = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Which type of *mobile* device?"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "radio_buttons",
					"options": [
						{
							"text": {
								"type": "plain_text",
								"text": "🍎 iPhone",
								"emoji": true
							},
							"value": "iphone"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "👽 Android",
								"emoji": true
							},
							"value": "android"
						},
					],
					"action_id": "select-os"
				}
			]
		}
	]
};
