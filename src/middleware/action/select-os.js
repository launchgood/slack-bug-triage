import {
  VIEW_MODAL_BUG_TRIAGE,
  SELECT_BROWSER,
} from '../../dialog/index';
import convoStore from '../../db/convo-store';

export default async function selectDeviceType(req) {
  const {
    ack,
    context: { conversation },
    client,
    body: {
      // eslint-disable-next-line camelcase
      trigger_id,
      view: {
        // eslint-disable-next-line camelcase
        id,
        hash,
      },
    },
    logger,
    payload: {
      selected_option: {
        value,
      },
    },
  } = req;

  await ack();

  try {
    logger.info(`Convo ${conversation.id} select-os ${value}`);
    conversation.device.os = value;
    convoStore.save(conversation);

    await ack();

    await await client.views.update({
      // eslint-disable-next-line camelcase
      trigger_id,
      // eslint-disable-next-line camelcase
      view_id: id,
      hash,
      view: {
        ...VIEW_MODAL_BUG_TRIAGE.view,
        blocks: SELECT_BROWSER.blocks,
      },
    });

    logger.info(`Convo ${conversation.id} view ${id} updated`);
  } catch (err) {
    logger.error(err);
  }
}
