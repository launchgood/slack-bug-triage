import db from '../../db/index';
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
    const { bugReport } = context;

    logger.info(`Bug report ${bugReport.id} launching modal...`);
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
    logger.info(`Bug report ${bugReport.id} launched modal view ${id}.`);
    await db().associateView(id, bugReport);
  } catch (err) {
    logger.error(err);
  }
}
