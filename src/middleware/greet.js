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

    const { conversation } = context;
    if (!conversation) {
      const convo = new BugReport(event);
      convoStore.save(convo);
      context.updateConversation(convo);

      logger.info(`Sending greeting for new conversation ${convo.id}`);
      const msg = INITIAL_MESSAGE(convo)
        .channel(channel)
        .threadTs(ts)
        .buildToObject();
      convo.greetEvent = await client.chat.postMessage(msg);
      convoStore.save(convo);
    }

    await next();
  } catch (err) {
    logger.error(err);
  }
}
