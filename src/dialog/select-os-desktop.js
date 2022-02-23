/* eslint-disable */
export const SELECT_OS_DESKTOP = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Device Info",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Which desktop *operating system (OS)*?"
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
								"text": "🪟 Windows",
								"emoji": true
							},
							"value": "windows"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "🍎 Mac OS",
								"emoji": true
							},
							"value": "macos"
						},
						{
							"text": {
								"type": "plain_text",
								"text": "🐧 Linux",
								"emoji": true
							},
							"value": "linux"
						}
					],
					"action_id": "select-os"
				}
			]
		}
	]
};
