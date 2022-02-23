/* eslint-disable */
export const INPUT_BUG_BASICS = {
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "🪲 Bug Basics",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "input-title",
				"placeholder": {
					"type": "plain_text",
					"text": "Example: computer turns homicidal after incorrect diagnostic"
				},
				"min_length": 10
			},
			"label": {
				"type": "plain_text",
				"text": "📰  Headline / Summary of Issue",
				"emoji": true
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "*Summarize* the issue in a few words."
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "input-steps-to-reproduce",
				"placeholder": {
					"type": "plain_text",
					"text": "1. AI predicted component malfunction\n2. Performed EVA to replace part\n3. Scanned part for malfunction\n4. ..."
				},
				"multiline": true,
				"min_length": 50,
				"focus_on_load": false
			},
			"label": {
				"type": "plain_text",
				"text": "🗺  Steps to Reproduce",
				"emoji": true
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "*Describe the _specific_ actions you took.* Avoid using assumed terminology, abbreviations, or proper nouns. Instead, describe _how_ you navigated there. *Be as specific as possible.*"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"multiline": true,
				"action_id": "input-actual-behavior",
				"placeholder": {
					"type": "plain_text",
					"text": "Example: computer said \"I'm sorry, Dave. I'm afraid I cannot do that\" and would not open the pod bay doors."
				}
			},
			"label": {
				"type": "plain_text",
				"text": "🪰  Actual Behavior"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "*What really happened?* What did you see? Did you see an error message. If so, what did it say? *Include anything unexpected.*"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"multiline": true,
				"action_id": "input-expected-behavior",
				"placeholder": {
					"type": "plain_text",
					"text": "Example: pod bay doors should open upon command plus computer should not try to kill me"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "🎯  Expected Behavior"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "*What really happened?* What did you see? Did you see an error message. If so, what did it say? *Include anything unexpected.*"
				}
			]
		}
	]
};