import {
  VIEW_MODAL_BUG_TRIAGE,
  SELECT_OS_MOBILE,
  SELECT_OS_DESKTOP,
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
    logger.info(`Convo ${conversation.id} select-device-type ${value}`);
    conversation.device.type = value;
    convoStore.save(conversation);

    await ack();

    const blocks = value === 'desktop'
      ? SELECT_OS_DESKTOP.blocks
      : SELECT_OS_MOBILE.blocks;

    await await client.views.update({
      // eslint-disable-next-line camelcase
      trigger_id,
      // eslint-disable-next-line camelcase
      view_id: id,
      hash,
      view: {
        ...VIEW_MODAL_BUG_TRIAGE.view,
        blocks,
      },
    });

    logger.info(`Convo ${conversation.id} view ${id} updated`);
  } catch (err) {
    logger.error(err);
  }
}
