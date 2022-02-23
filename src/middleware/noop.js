export default async function noop(req) {
  const { logger } = req;
  logger.info('Finished.');
}
