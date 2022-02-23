/* eslint-disable */
export const SELECT_BROWSER = {
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
        "text": "Which *browser* were you using?"
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
                "text": ":google-chrome: Google Chrome",
                "emoji": true
              },
              "value": "chrome"
            },
            {
              "text": {
                "type": "plain_text",
                "text": ":safari: Safari",
                "emoji": true
              },
              "value": "safari"
            },
            {
              "text": {
                "type": "plain_text",
                "text": ":firefox: Firefox",
                "emoji": true
              },
              "value": "firefox"
            },
            {
              "text": {
                "type": "plain_text",
                "text": ":drooling_face: Edge / IE",
                "emoji": true
              },
              "value": "edge"
            }
          ],
          "action_id": "select-browser"
        }
      ]
    }
  ]
};
