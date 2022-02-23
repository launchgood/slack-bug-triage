import objectMapper from 'object-mapper';
import { BUG_REPORT_WITH_ACTIONS } from '../../dialog/index';
import convoStore from '../../db/convo-store';

// eslint-disable-next-line func-names
export default function (imports) {
  const {
    octokit,
    owner,
    repo,
  } = imports;

  return async function viewSubmit(req) {
    const {
      ack,
      client,
      context: { conversation },
      view: {
        state: {
          values,
        },
      },
      logger,
    } = req;

    try {
      const actionIdToTargetProperty = {
        'input-title': 'title',
        'input-steps-to-reproduce': 'basics.steps',
        'input-actual-behavior': 'basics.behaviorActual',
        'input-expected-behavior': 'basics.behaviorExpected',
      };
      Object.values(values).forEach((section) => {
        Object.keys(section).forEach((actionId) => {
          const action = section[actionId];
          logger.info(`action ${actionId}: `, action);
          const targetPropertyId = actionIdToTargetProperty[actionId];
          const { value } = action;
          objectMapper.setKeyValue(conversation, targetPropertyId, value);
        });
      });

      await ack();

      logger.info(`Conversation ${conversation.id} creating permalink...`);
      const {
        parentEvent: {
          channel,
          ts,
        }
      } = conversation;
      const {
        permalink,
      } = await client.chat.getPermalink({
        channel,
        message_ts: ts,
      });
      conversation.permalink = permalink;
      convoStore.save(conversation);
      logger.info(`Conversation ${conversation.id} permalink created OK`);

      if (!conversation.userProfile) {
        logger.info(`Conversation ${conversation.id} fetching user...`);
        const { user } = conversation.parentEvent;
        const res = await client.users.profile.get({
          user,
        });
        conversation.userProfile = res.profile;
        logger.info(`Conversation ${conversation.id} fetched user OK: ${conversation.userProfile.real_name}`);
      }

      logger.info(`Conversation ${conversation.id} creating new Github issue...`);
      const {
        data,
      } = await octokit.rest.issues.create({
        owner,
        repo,
        title: conversation.title,
        body: conversation.githubMarkdown,
        labels: ['Bug', 'Slack'],
      });
      logger.info(`Conversation ${conversation.id} created Github issue #${data.number}`, data);
      conversation.githubIssue = data;
      convoStore.save(conversation);

      logger.info(`Conversation ${conversation.id} updating message...`, conversation);
      const msg = BUG_REPORT_WITH_ACTIONS(conversation)
        .channel(conversation.parentEvent.channel)
        .threadTs(conversation.parentEvent.ts)
        .buildToObject();
      const newGreetEvent = await client.chat.postMessage(msg);
      await client.chat.delete({
        channel: conversation.greetEvent.channel,
        ts: conversation.greetEvent.ts,
      });
      conversation.greetEvent = newGreetEvent;
      convoStore.save(conversation);

      logger.info(`Conversation ${conversation.id} updated message OK:`, conversation.greetEvent);
    } catch (err) {
      logger.error(err);
      logger.error(err.stack);
    }
  };
}
