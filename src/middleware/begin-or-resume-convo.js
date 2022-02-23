import BugReport from '../models/bug-report';
import convoStore from '../db/convo-store';

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
    const { conversation } = context;

    // conversation exists, do nothing
    if (conversation) {
      const convo = convoStore.get(conversation.id);
      logger.info(`Existing conversation: ${convo.id}`);
      await next();
      return;
    }

    // this is a message within chat
    if (event) {
      logger.info('Looking up conversation from event...');
      const convo = convoStore.findForEvent(event);
      if (convo) {
        logger.info(`Existing conversation: ${convo.id}`);
        await next();
        return;
      }

      logger.info('Starting new conversation...');
      const newConvo = new BugReport(event);
      convoStore.save(newConvo);
      logger.info(`New conversation: ${newConvo.id}`);

      logger.info(`Conversation ${newConvo.id} fetching user...`);
      const { user } = newConvo.parentEvent;
      const res = await client.users.profile.get({
        user,
      });
      newConvo.userProfile = res.profile;
      logger.info(`Conversation ${newConvo.id} fetched user OK: ${newConvo.userProfile.real_name}`);
      convoStore.save(newConvo);

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

    logger.info('Looking up convo...');

    const { view } = body;
    if (view) {
      const { id, type } = view;
      if (type === 'modal') {
        logger.info(`Looking up convo for view ${id} (type: ${type}) to hand over...`);
        const convo = convoStore.findByViewId(id);
        if (convo) {
          logger.info(`Converation ${convo.id} resuming...`);
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
  }
}
