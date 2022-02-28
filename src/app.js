import bolt from '@slack/bolt';
import dotEnv from '@ladjs/env';
import github from '@actions/github';
import AWS from 'aws-sdk';
import {
  action,
  beginOrResumeConvo,
  greet,
  noop,
  noBotMessages,
  noReplies,
  uploadFilesToAws,
  repliesOnly,
} from './middleware/index';

const env = dotEnv();

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
});

const s3 = new AWS.S3({
  apiVersion: env.AWS_S3_API_VERSION,
});

// eslint-disable-next-line new-cap
const octokit = new github.getOctokit(env.GITHUB_TOKEN);

const { App, LogLevel } = bolt;
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  logLevel: LogLevel.INFO,
  // logLevel: LogLevel.DEBUG,
  signingSecret: env.SLACK_SIGNING_SECRET,
  // use webhook (not socket) when deployed to heroku
  socketMode: env.NODE_ENV !== 'PRODUCTION',
  appToken: env.SLACK_APP_TOKEN,
});

// start convo for each message, if one does not already exist
app.use(beginOrResumeConvo);

const uploadFiles = uploadFilesToAws({
  AWS_S3_BUCKET: env.AWS_S3_BUCKET,
  SLACK_BOT_TOKEN: env.SLACK_BOT_TOKEN,
  octokit,
  owner: env.GITHUB_OWNER,
  repo: env.GITHUB_REPO,
  s3,
});

// sends intro dialog first, then processes files
app.message(noBotMessages, noReplies, greet, uploadFiles, noop);

// replies with files get added to bug report
app.message(noBotMessages, repliesOnly, uploadFiles, noop);

app.action('launch-triage-modal', action.launchTriageModal);
app.action('select-device-type', action.selectDeviceType);
app.action('select-os', action.selectOs);
app.action('select-browser', action.selectBrowser);

app.view({ type: 'view_submission' }, action.viewSubmit({
  octokit,
  owner: env.GITHUB_OWNER,
  repo: env.GITHUB_REPO,
}));

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  // eslint-disable-next-line no-console
  console.log(`⚡️ Bolt app is running! port: ${port}`);
})();
