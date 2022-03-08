import NON_MESSAGE_EVENTS from '../models/events';

// eslint-disable-next-line consistent-return
export default async function ignoreNonMessageEvents({ event, logger, next }) {
  const logAndNext = async () => {
    logger.debug('Event is not a non-message event, proceding...');
    return next();
  };
  if (!event) {
    return logAndNext();
  }
  const { subtype } = event;
  if (!subtype) {
    return logAndNext();
  }
  if (!NON_MESSAGE_EVENTS.includes(subtype)) {
    return logAndNext();
  }
  logger.info(`Ignoring '${subtype}' non-message event`);
}
