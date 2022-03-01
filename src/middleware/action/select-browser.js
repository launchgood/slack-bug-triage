import {
  VIEW_MODAL_BUG_TRIAGE,
  VIEW_SUBMIT_BUTTON,
  INPUT_BUG_BASICS,
} from '../../dialog/index';
import db from '../../db/index';

function clone(obj) {
  // quick hacky way to make sure we don't modify the base template
  return JSON.parse(JSON.stringify(obj));
}

function setInitialValues(originalBlocks, bugReport) {
  const blocks = clone(originalBlocks);

  // this method didn't work for some reason, so just hard-coded
  // return objectMapper.merge(bugReport, blocks, {
  //   'parentEvent.text': '[1].element.initial_value',
  //   title: '[1].element.initial_value',
  //   'basics.steps': '[4].element.initial_value',
  //   'basics.behaviorActual': '[7].element.initial_value',
  //   'basics.behaviorExpected': '[10].element.initial_value',
  // });

  // blocks[1].element.initial_value = bugReport.parentEvent.text;

  // use initial message as steps to reproduce
  blocks[4].element.initial_value = bugReport.parentEvent.text;

  return blocks;
}

export default async function selectDeviceType(req) {
  const {
    ack,
    context: { bugReport },
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
    logger.info(`Convo ${bugReport.id} select-browser ${value}`);
    bugReport.device.browser = value;
    await db().save(bugReport);

    await ack();

    const blocks = setInitialValues(INPUT_BUG_BASICS.blocks, bugReport);

    await await client.views.update({
      // eslint-disable-next-line camelcase
      trigger_id,
      // eslint-disable-next-line camelcase
      view_id: id,
      hash,
      view: {
        ...VIEW_MODAL_BUG_TRIAGE.view,
        ...VIEW_SUBMIT_BUTTON.view,
        blocks,
      },
    });

    logger.info(`Convo ${bugReport.id} view ${id} updated`);
  } catch (err) {
    logger.error(err);
  }
}
