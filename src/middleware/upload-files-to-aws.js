import axios from 'axios';
import {
  BUG_REPORT_WITH_ACTIONS,
  INITIAL_MESSAGE,
} from '../dialog/index';
import db from '../db/index';

export default function uploadFilesToAws(imports) {
  const {
    AWS_S3_BUCKET,
    SLACK_BOT_TOKEN,
    octokit,
    owner,
    repo,
    s3,
  } = imports;

  // eslint-disable-next-line consistent-return
  return async (req) => {
    const {
      client,
      context,
      event,
      logger,
      next,
      payload,
    } = req;

    const { files } = payload;
    const { bugReport } = context;

    if (!files) {
      logger.info(`Bug report ${bugReport.id} no files to process...`);
      return next();
    }

    try {
      logger.info(`Bug report ${bugReport.id} ${files.length} files...`);
      const uploadedFiles = await (Promise.all(
        files.map(async (file) => {
          logger.debug(`  > File: ${file.id}`, file);

          const res1 = await axios.get(file.url_private, {
            headers: {
              Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            },
            responseType: 'arraybuffer',
          });
          logger.debug();

          const filename = `slack-upload-${file.id}.${file.filetype}`;
          const uploadParams = {
            Bucket: AWS_S3_BUCKET,
            Key: filename,
            Body: res1.data,
          };

          logger.info(`Bug report ${bugReport.id} uploading ${filename} to AWS...`);
          const res2 = await (new Promise((resolve, reject) => {
            // call S3 to retrieve upload file to specified bucket
            s3.upload(uploadParams, (err, data) => {
              if (err) {
                reject(err);
              } else if (data) {
                resolve(data);
              }
            });
          }));
          logger.debug(`Bug report ${bugReport.id} file upload to S3 OK:`, res2);

          // Upload the file to a new channel using the file buffer (requires files:write scope)
          // const slack = await client.files.upload({
          //   channels: channel,
          //   // eslint-disable-next-line camelcase
          //   thread_ts: parent_ts || ts,
          //   initial_comment: '✅  Will be included in your bug report.',
          //   file: res1.data,
          // });
          // logger.debug('File upload to slack OK:', slack);

          return {
            ...file,
            ...res2,
            altText: file.title,
            imageUrl: res2.Location,
          };
        }),
      ));

      const assignToConversation = async (report) => {
        const {
          parentEvent,
          greetEvent,
        } = report;
        // eslint-disable-next-line no-param-reassign
        report.files = report.files.concat(uploadedFiles);
        if (report.githubIssue) {
          const {
            githubIssue: {
              number,
            },
          } = report;
          logger.info(`Bug report ${report.id} updating existing Github issue #${number}...`);
          const githubRes = await octokit.rest.issues.update({
            owner,
            repo,
            issue_number: number,
            body: report.githubMarkdown,
          });
          logger.info(`Bug report ${report.id} updated Github issue #${number} OK`);
          logger.debug(`Bug report ${report.id} updated Github issue #${number} is:`, githubRes);

          logger.info(`Bug report ${report.id} updating existing message...`);
          const msg = BUG_REPORT_WITH_ACTIONS(report)
            .channel(parentEvent.channel)
            .threadTs(parentEvent.ts)
            .buildToObject();
          const newGreetEvent = await client.chat.postMessage(msg);
          await client.chat.delete({
            channel: greetEvent.channel,
            ts: greetEvent.ts,
          });
          // eslint-disable-next-line no-param-reassign
          report.greetEvent = newGreetEvent;
          await db().save(report);
          logger.info(`Bug report ${report.id} updated existing message OK`);
          logger.debug(`Bug report ${report.id} updated existing message is:`, report);
        } else {
          logger.info(`Bug report ${report.id} updating greeting to include files...`);
          const msg = INITIAL_MESSAGE(report)
            .channel(parentEvent.channel)
            .threadTs(parentEvent.ts)
            .ts(greetEvent.ts)
            .asUser(true)
            .buildToObject();
          await client.chat.delete({
            channel: greetEvent.channel,
            ts: greetEvent.ts,
          });
          // eslint-disable-next-line no-param-reassign
          report.greetEvent = await client.chat.postMessage(msg);
          logger.info(`Bug report ${report.id} updating greeting to include files OK`);
        }
        await db().save(report);
      };

      if (bugReport && bugReport.files) {
        await assignToConversation(bugReport);
      } else {
        const foundBugReport = await db().findForEvent(event);
        logger.info(`Bug report ${foundBugReport.id} Looking up bug report for event...`);
        if (foundBugReport) {
          logger.info(`Bug report ${foundBugReport.id} found`);
          logger.debug(`Bug report ${foundBugReport.id} is:`, foundBugReport);
          await assignToConversation(foundBugReport);
        } else {
          logger.error('Could not find bug report for event:', event);
        }
      }

      await next();
    } catch (err) {
      logger.error(err);
    }
  };
}
