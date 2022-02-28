import { INITIAL_MESSAGE } from '../dialog/index';
import BugReport from '../models/bug-report';
import convoStore from '../db/convo-store';

export default async function greet(req) {
  const {
    context,
    client,
    event,
    logger,
    next,
  } = req;
  try {
    const { channel, ts } = event;

    const { bugReport } = context;
    if (!bugReport) {
      const newBugReport = new BugReport(event);
      convoStore.save(newBugReport);

      logger.info(`New bug report ${newBugReport.id} sending greeting...`);
      const msg = INITIAL_MESSAGE(newBugReport)
        .channel(channel)
        .threadTs(ts)
        .buildToObject();
      newBugReport.greetEvent = await client.chat.postMessage(msg);
      logger.info(`New bug report ${newBugReport.id} sent greeting OK`);
      logger.debug(`New bug report ${newBugReport.id} greet event is:`, newBugReport.greetEvent);
      convoStore.save(newBugReport);
    }

    await next();
  } catch (err) {
    logger.error(err);
  }
}
