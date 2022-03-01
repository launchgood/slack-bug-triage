import BugReport from '../models/bug-report';
import db from '../db/index';

export default async function beginOrResumeConvo(req) {
  const {
    body,
    client,
    context,
    event,
    logger,
    payload,
    next,
  } = req;

  try {
    const { bugReport } = context;

    const meta = {
      body,
      context,
      event,
      payload,
    };
    logger.debug('Looking up bug report:', meta);

    if (bugReport) {
      const report = await db().get(bugReport.id);
      logger.info(`Bug report ${report.id} already exists on context...`);
      await next();
      return;
    }

    // this is a message within chat
    if (event) {
      logger.info('Looking up bug report from event...');
      const report = await db().findForEvent(event);
      if (report) {
        context.bugReport = report;
        logger.info(`Bug report ${report.id} resuming from event...`);
        logger.debug(`Existing bug report ${report.id} is:`, report);
        await next();
        return;
      }

      // eslint-disable-next-line camelcase
      const { type, channel_type } = event;
      // eslint-disable-next-line camelcase
      if (type !== 'message' || channel_type !== 'channel') {
        logger.info('Ignoring non channel message:');
        logger.debug('Ingoring event:', meta);
        await next();
        return;
      }
      logger.info('Starting new bug report...');
      const newBugReport = new BugReport(event);
      await db().save(newBugReport);
      logger.debug(`New bug report: ${newBugReport.id}`);

      logger.info(`Bug report ${newBugReport.id} fetching user...`);
      const { user } = newBugReport.parentEvent;
      const res = await client.users.profile.get({
        user,
      });
      newBugReport.userProfile = res.profile;
      await db().save(newBugReport);
      logger.debug(`Bug report ${newBugReport.id} fetched user OK:`, newBugReport.userProfile);

      await next();
      return;
    }

    const { view } = body;
    if (view) {
      logger.info('Looking up bug report from view...');
      const { id, type } = view;
      if (type === 'modal') {
        logger.info(`Looking up bug report for view ${id} (type: ${type}) to hand over...`);
        const bugReportFromView = await db().findByViewId(id);
        if (bugReportFromView) {
          logger.info(`Bug report ${bugReportFromView.id} resuming...`);
          context.bugReport = bugReportFromView;
          logger.debug(`Bug report ${bugReportFromView.id} is:`, bugReportFromView);
          await next();
          return;
        }
        logger.error(`Unexpected view ID: ${id}`);
      } else {
        logger.warn(`Unexpected convo type: ${type}`);
      }
    }

    // user clicked an action
    if (body.type === 'block_actions' && payload.action_id.includes('.')) {
      logger.info('Looking up bug report from block action regex...');
      const report = await db().findForActionId(payload.action_id);
      if (report) {
        context.bugReport = report;
        logger.info(`Bug report ${report.id} triggered block action...`);
        logger.debug(`Existing bug report ${report.id} is:`, report);
        await next();
        return;
      }
    }

    logger.warn('Could not find existing bug report:', meta);
    await next();
  } catch (err) {
    logger.error('Error while begin or resume bug report:', {
      body,
      context,
      event,
      payload,
    }, err);
  }
}
