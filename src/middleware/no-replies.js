// eslint-disable-next-line consistent-return
export default async function noReplies({ event, logger, next }) {
  if (!event.thread_ts) {
    logger.debug('Handling non-reply...');
    return next();
  }
  logger.debug('Ignoring reply.');
}