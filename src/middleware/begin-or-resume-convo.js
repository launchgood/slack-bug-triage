import BugReport from '../models/bug-report';
import convoStore from '../db/convo-store';

export default async function beginOrResumeConvo(req) {
  const {
    body,
    context,
    event,
    logger,
    payload,
    next,
  } = req;

  try {
    console.log('----------------------------------');
    console.log('REQ:', Object.keys(req));
    console.log('----------------------------------');

    const { conversation } = context;

    // conversation exists, do nothing
    if (conversation) {
      const convo = convoStore.get(conversation.id);
      logger.info(`Existing conversation: ${convo.id}:`, convo);
      await next();
      return;
    }

    // this is a message within chat
    if (event) {
      logger.info('Starting new conversation...');
      const convo = convoStore.findForEventPayload(event, payload);
      if (convo) {
        logger.info(`Existing conversation: ${convo.id}:`, convo);
        await next();
        return;
      }
      const newConvo = new BugReport(payload.user, event);
      convoStore.save(newConvo);
      logger.info(`New conversation: ${newConvo.id}`);
      await context.updateConversation(newConvo);
      await next();
      return;
    }

    const meta = {
      body,
      context,
      event,
      payload,
    };

    logger.info('Looking up convo...', meta);

    const { view } = body;
    if (view) {
      const { id, type } = view;
      if (type === 'modal') {
        logger.info(`Looking up convo for view ${id} (type: ${type}) to hand over...`);
        const convo = convoStore.findByViewId(id);
        if (convo) {
          logger.info(`Resuming convo ${convo.id}...`);
          context.conversation = convo;
          await next();
          return;
        }
        logger.error(`Unexpected view ${id}`);
      } else {
        logger.warn(`Unexpected convo type: ${type}`);
      }
    }

    logger.warn('Could not resume convo:', meta);
    await next();
  } catch (err) {
    logger.error('Error while begin or resume convo:', err);
    console.log('NEXT IS:', typeof next);
    console.log(next);
  }
}
