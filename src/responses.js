// eslint-disable-next-line import/prefer-default-export, camelcase
export function unexpectedResponse({ channel, client, thread_ts }) {
  return async (message) => {
    await client.chat.postMessage({
      text: `❌ Unexpected response: ${message}`,
      channel: channel.id,
      // eslint-disable-next-line camelcase
      thread_ts,
    });
  };
}
