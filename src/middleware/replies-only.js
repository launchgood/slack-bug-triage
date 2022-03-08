// eslint-disable-next-line consistent-return
export default async function repliesOnly({ event, logger, next }) {
  if (event.thread_ts) {
    logger.debug('Handling reply...');
    return next();
  }
  logger.debug('Ignoring non-reply.');
}
