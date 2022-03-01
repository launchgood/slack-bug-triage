import objectMapper from 'object-mapper';
import { BUG_REPORT_WITH_ACTIONS } from '../../dialog/index';
import db from '../../db/index';

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
      context: { bugReport },
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
          objectMapper.setKeyValue(bugReport, targetPropertyId, value);
        });
      });

      await ack();

      logger.info(`Conversation ${bugReport.id} creating permalink...`);
      const {
        parentEvent: {
          channel,
          ts,
        }
      } = bugReport;
      const {
        permalink,
      } = await client.chat.getPermalink({
        channel,
        message_ts: ts,
      });
      bugReport.permalink = permalink;
      await db().save(bugReport);
      logger.info(`Conversation ${bugReport.id} permalink created OK`);

      if (!bugReport.userProfile) {
        logger.info(`Conversation ${bugReport.id} fetching user...`);
        const { user } = bugReport.parentEvent;
        const res = await client.users.profile.get({
          user,
        });
        bugReport.userProfile = res.profile;
        logger.info(`Conversation ${bugReport.id} fetched user OK: ${bugReport.userProfile.real_name}`);
      }

      logger.info(`Conversation ${bugReport.id} creating new Github issue...`);
      const {
        data,
      } = await octokit.rest.issues.create({
        owner,
        repo,
        title: bugReport.title,
        body: bugReport.githubMarkdown,
        labels: ['Bug', 'Slack'],
      });
      logger.info(`Conversation ${bugReport.id} created Github issue #${data.number}`, data);
      bugReport.githubIssue = data;
      await db().save(bugReport);

      logger.info(`Conversation ${bugReport.id} updating message...`, bugReport);
      const msg = BUG_REPORT_WITH_ACTIONS(bugReport)
        .channel(bugReport.parentEvent.channel)
        .threadTs(bugReport.parentEvent.ts)
        .buildToObject();
      const newGreetEvent = await client.chat.postMessage(msg);
      await client.chat.delete({
        channel: bugReport.greetEvent.channel,
        ts: bugReport.greetEvent.ts,
      });
      bugReport.greetEvent = newGreetEvent;
      await db().save(bugReport);

      logger.info(`Conversation ${bugReport.id} updated message OK:`, bugReport.greetEvent);
    } catch (err) {
      logger.error(err);
      logger.error(err.stack);
    }
  };
}
