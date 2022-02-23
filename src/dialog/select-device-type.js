/* eslint-disable */
export const SELECT_DEVICE_TYPE = {
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
        "text": "Which *device* you were using?"
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
                "text": "🖥 Desktop",
                "emoji": true
              },
              "value": "desktop"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "📱 Mobile",
                "emoji": true
              },
              "value": "mobile"
            }
          ],
          "action_id": "select-device-type"
        }
      ]
    }
  ]
};
