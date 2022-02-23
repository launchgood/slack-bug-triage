import * as action from './action/index';
import beginOrResumeConvo from './begin-or-resume-convo';
import greet from './greet';

const noBotMessages = async ({ logger, message, next }) => {
  if (message.subtype !== 'bot_message') {
    logger.debug('Handling non-bot...');
    await next();
  }
};

const noReplies = async ({ event, logger, next }) => {
  if (!event.thread_ts) {
    logger.debug('Handling non-reply...');
    await next();
  }
};

const repliesOnly = async ({ event, logger, next }) => {
  if (event.thread_ts) {
    logger.debug('Handling reply...');
    await next();
  }
};

export {
  action,
  beginOrResumeConvo,
  greet,
  noBotMessages,
  noReplies,
  repliesOnly,
};
