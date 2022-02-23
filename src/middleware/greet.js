import { INITIAL_MESSAGE } from '../dialog/index';
import BugReport from '../models/bug-report';

export default async function greet(req) {
  const {
    context,
    client,
    event,
    logger,
    payload,
  } = req;
  try {
    const { channel, ts } = event;
    const { conversation } = context;
    if (!conversation) {
      const convo = new BugReport(payload.user, event);
      logger.info(`Sending greeting for new conversation ${convo.id}`);
      await client.chat.postMessage({
        ...INITIAL_MESSAGE,
        channel,
        thread_ts: ts,
      });
    }
  } catch (err) {
    logger.error(err);
  }
}
