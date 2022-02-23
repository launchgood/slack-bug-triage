import axios from 'axios';

export default function persistFiles(imports) {
  const {
    AWS_S3_BUCKET,
    SLACK_BOT_TOKEN,
    s3,
  } = imports;

  return async (req) => {
    const {
      client,
      context,
      event,
      logger,
      next,
      payload,
    } = req;

    const { files } = payload;
    const {
      channel,
      // eslint-disable-next-line camelcase
      parent_ts,
      ts,
    } = event || {};

    if (!files) {
      await next();
      return;
    }

    const { conversation } = context;

    logger.info(`Processing ${files.length} files...`);
    const results = await (Promise.all(
      files.map(async (file) => {
        logger.info(`  > File: ${file.id}`, file);

        const res1 = await axios.get(file.url_private, {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          },
          responseType: 'arraybuffer',
        });

        const filename = `slack-upload-${file.id}.${file.filetype}`;
        const uploadParams = {
          Bucket: AWS_S3_BUCKET,
          Key: filename,
          Body: res1.data,
        };

        logger.info(`Uploading ${filename} to AWS...`);
        const res2 = await (new Promise((resolve, reject) => {
          // call S3 to retrieve upload file to specified bucket
          s3.upload(uploadParams, (err, data) => {
            if (err) {
              reject(err);
            } else if (data) {
              resolve(data);
            }
          });
        }));
        logger.debug('File upload to S3 OK:', res2);

        // Upload the file to a new channel using the file buffer (requires files:write scope)
        const slack = await client.files.upload({
          channels: channel,
          // eslint-disable-next-line camelcase
          thread_ts: parent_ts || ts,
          initial_comment: '✅  Will be included in your bug report.',
          file: res1.data,
        });
        logger.debug('File upload to slack OK:', slack);

        return {
          data: res1.data,
          s3: res2,
        };
      }),
    ));

    const finalFiles = await Promise.all(results.map(async (file) => {
      // Upload the file to a new channel using the file buffer (requires files:write scope)
      // eslint-disable-next-line no-param-reassign
      const slack = await client.files.upload({
        channels: channel,
        // eslint-disable-next-line camelcase
        thread_ts: parent_ts || ts,
        initial_comment: '✅  Will be included in your bug report.',
        file: file.data,
      });
      logger.debug('File upload to slack OK:', slack);
      return {
        ...file,
        slack,
      };
    }));



    if (files) {
      // TODO: DRY - this is used elswhere make it a lib
      // eslint-disable-next-line max-len
      convo.files = await Promise.all(files.map(async (file) => {
        // Upload the file to a new channel using the file buffer (requires files:write scope)
        // eslint-disable-next-line no-param-reassign
        const slack = await client.files.upload({
          channels: channel,
          // eslint-disable-next-line camelcase
          thread_ts: ts,
          initial_comment: '✅  Will be included in your bug report.',
          file: file.data,
        });
        logger.debug('File upload to slack OK:', slack);
        return {
          ...file,
          slack,
        };
      }));
    }
  };
}
