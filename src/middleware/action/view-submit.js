import objectMapper from 'object-mapper';

export default async function viewSubmit(req) {
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
    view: {
      state: {
        values,
      },
    },
    logger,
  } = req;

  const actionIdToTargetProperty = {
    'input-steps-to-reproduce': 'basics.steps',
    'input-actual-behavior': 'basics.behaviorActual',
    'input-expected-behavior': 'basics.behaviorExpected',
  };
  Object.values(values).forEach((section) => {
    Object.keys(section).forEach((actionId) => {
      const action = section[actionId];
      logger.info(`action ${actionId}: `, action);
      const targetPropertyId = actionIdToTargetProperty[actionId];
      const { value } = action;
      objectMapper.setKeyValue(conversation, targetPropertyId, value);
    });
  });

  await ack();

  console.log(conversation);
}
