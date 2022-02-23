import bolt from '@slack/bolt';
import env from '@ladjs/env';
import {
  action,
  beginOrResumeConvo,
  greet,
  noBotMessages,
  noReplies,
} from './middleware/index';

const dotEnv = env();
const {
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  SLACK_APP_TOKEN,
} = dotEnv;

const { App, LogLevel } = bolt;
const app = new App({
  token: SLACK_BOT_TOKEN,
  logLevel: LogLevel.INFO,
  // logLevel: LogLevel.DEBUG,
  signingSecret: SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
});

// start convo for each message, if one does not already exist
app.use(beginOrResumeConvo);

// sends intro dialog and first action message
app.message(noBotMessages, noReplies, greet);

app.action('launch-triage-modal', action.launchTriageModal);
app.action('select-device-type', action.selectDeviceType);
app.action('select-os', action.selectOs);
app.action('select-browser', action.selectBrowser);

app.view({ type: 'view_submission' }, action.viewSubmit);

/* Add functionality here */

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  // eslint-disable-next-line no-console
  console.log(`⚡️ Bolt app is running! port: ${port}`);
})();
