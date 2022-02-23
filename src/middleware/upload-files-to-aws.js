import axios from 'axios';
import {
  BUG_REPORT_WITH_ACTIONS,
  INITIAL_MESSAGE
} from '../dialog/index';
import convoStore from '../db/convo-store';

export default function uploadFilesToAws(imports) {
  const {
    AWS_S3_BUCKET,
    SLACK_BOT_TOKEN,
    octokit,
    owner,
    repo,
    s3,
  } = imports;

  return async (req) => {
    const {
      client,
      context,
      event,
      logger,
      next,
      payload,
    } = req;
    logger.info('Handling message...');

    const { files } = payload;
    const { conversation } = context;

    if (!files) {
      logger.info('No files to process...');
      await next();
      return;
    }

    try {
      logger.info(`Processing ${files.length} files...`);
      const uploadedFiles = await (Promise.all(
        files.map(async (file) => {
          logger.debug(`  > File: ${file.id}`, file);

          const res1 = await axios.get(file.url_private, {
            headers: {
              Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            },
            responseType: 'arraybuffer',
          });

          const filename = `slack-upload-${file.id}.${file.filetype}`;
          const uploadParams = {
            Bucket: AWS_S3_BUCKET,
            Key: filename,
            Body: res1.data,
          };

          logger.info(`Uploading ${filename} to AWS...`);
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
          logger.debug('File upload to S3 OK:', res2);

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

      const assignToConversation = async (convo) => {
        const {
          parentEvent,
          greetEvent,
        } = convo;
        // eslint-disable-next-line no-param-reassign
        convo.files = convo.files.concat(uploadedFiles);
        if (convo.githubIssue) {
          const {
            githubIssue: {
              number,
            },
          } = convo;
          logger.info(`Conversation ${conversation.id} updating existing Github issue #${number}...`);
          await octokit.rest.issues.update({
            owner,
            repo,
            issue_number: number,
            body: convo.githubMarkdown,
          });
          logger.info(`Conversation ${conversation.id} created Github issue #${number} OK`);

          logger.info(`Conversation ${conversation.id} updating existing message...`);
          const msg = BUG_REPORT_WITH_ACTIONS(convo)
            .channel(parentEvent.channel)
            .threadTs(parentEvent.ts)
            .buildToObject();
          const newGreetEvent = await client.chat.postMessage(msg);
          await client.chat.delete({
            channel: greetEvent.channel,
            ts: greetEvent.ts,
          });
          conversation.greetEvent = newGreetEvent;
          convoStore.save(conversation);
          logger.info(`Conversation ${conversation.id} updated existing OK`);
        } else {
          logger.info(`Conversation ${convo.id} updating greeting to include files...`);
          const msg = INITIAL_MESSAGE(convo)
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
          convo.greetEvent = await client.chat.postMessage(msg);
          logger.info(`Conversation ${convo.id} updating greeting to include files OK`);
        }
        convoStore.save(convo);
      };

      if (conversation && conversation.files) {
        await assignToConversation(conversation);
      } else {
        logger.info('Looking up convo for event...');
        const convo = convoStore.findForEvent(event);
        if (convo) {
          logger.info(`Conversation ${convo.id} found`);
          await assignToConversation(convo);
        } else {
          logger.error('Could not find convo for event:', event);
        }
      }

      await next();
    } catch (err) {
      logger.error(err);
    }
  };
}
