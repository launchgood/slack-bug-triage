import {
  Blocks,
  Elements,
  Message,
} from 'slack-block-builder';
import { capitalCase } from 'change-case';

// eslint-disable-next-line import/prefer-default-export
export function BUG_REPORT_WITH_ACTIONS(bugReport) {
  const {
    basics: {
      steps,
      behaviorActual,
      behaviorExpected,
    },
    githubIssue: {
      // eslint-disable-next-line camelcase
      html_url,
      number,
    },
    title,
    device: {
      browser,
      os,
      type,
    },
    deviceTypeIcon,
    relativeTime,
    userProfile: {
      // eslint-disable-next-line camelcase
      display_name,
      // eslint-disable-next-line camelcase
      image_original,
      // eslint-disable-next-line camelcase
      real_name,
    },
  } = bugReport;

  const blocks = [];

  // title
  blocks.push(Blocks.Header({
    text: title,
  }));

  blocks.push(Blocks.Context().elements(
    // device info
    `*${deviceTypeIcon} ${capitalCase(type)}* _${capitalCase(os)}_ (${capitalCase(browser)})`,

    // avatar and name of user who reported
    Elements.Img({
      // eslint-disable-next-line camelcase
      altText: `${display_name} avatar`,
      // eslint-disable-next-line camelcase
      imageUrl: image_original,
    }),
    // eslint-disable-next-line camelcase
    `*${real_name}* _${relativeTime}_`,
  ));

  // steps to reproduce with image as sidebar
  const stepsSection = Blocks.Section({
    // eslint-disable-next-line camelcase
    text: `*Steps to Reproduce*\n${steps}`,
  });
  if (bugReport.files.length) {
    const [image] = bugReport.files;
    stepsSection.accessory(Elements.Img({
      altText: image.altText,
      imageUrl: image.imageUrl,
    }));
  }
  blocks.push(stepsSection);

  // actual & expected behavior, side by side
  blocks.push(Blocks.Section().fields(
    `*Actual Behavior*\n${behaviorActual}`,
    `*Expected Behavior*\n${behaviorExpected}`,
  ));

  blocks.push(Blocks.Context().elements([]
    // thumbnail & number of uploads
    .concat(bugReport.filesAsSlackElements)
    .concat(`*${bugReport.files.length}* uploads`)

    // link to external issue in github
    // eslint-disable-next-line camelcase
    .concat(`<${html_url}|🐞 Github Issue #${number} ↗️>`)));

  blocks.push(Blocks.Divider());

  // instructions
  blocks.push(Blocks.Context().elements('ℹ️ *TIP:* new image replies will be uploaded to the bug report.'));

  return Message()
    .text(`Issue #${bugReport.githubIssue.number}: ${bugReport.title}`)
    .blocks(blocks);
}
