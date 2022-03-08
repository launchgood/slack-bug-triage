// eslint-disable-next-line consistent-return
export default async function noBotMessages({ logger, message, next }) {
  if (message.subtype !== 'bot_message') {
    logger.debug('Handling non-bot...');
    return next();
  }
  logger.debug('Ignoring bot message.');
}
