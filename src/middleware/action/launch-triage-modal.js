import convoStore from '../../db/convo-store';
import {
  VIEW_MODAL_BUG_TRIAGE,
  SELECT_DEVICE_TYPE,
} from '../../dialog/index';

export default async function launchTriageModal({
  ack,
  body: {
    // eslint-disable-next-line camelcase
    trigger_id,
  },
  context,
  client,
  logger,
}) {
  try {
    await ack();
    const { conversation } = context;

    logger.info(`Launching modal for conversation ${conversation.id}`);
    const view = {
      ...VIEW_MODAL_BUG_TRIAGE.view,
      blocks: SELECT_DEVICE_TYPE.blocks,
    };
    const {
      view: {
        id,
      },
    } = await client.views.open({
      // eslint-disable-next-line camelcase
      trigger_id,
      view,
    });

    logger.info(`Associating view ${id} with conversation ${conversation.id}`);
    convoStore.associateView(id, conversation);
  } catch (err) {
    logger.error(err);
  }
}
