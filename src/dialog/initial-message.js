import {
  Blocks,
  Elements,
  Message,
} from 'slack-block-builder';

// eslint-disable-next-line import/prefer-default-export
export function INITIAL_MESSAGE(bugReport) {
  const {
    filesAsSlackElements,
  } = bugReport;
  const cta = () => Blocks.Actions().elements([
    Elements.Button({
      actionId: 'launch-triage-modal',
      text: '👉 Add Details 👈',
    }).primary(),
  ]);

  const blocks = [
    Blocks.Header({
      text: '🐞 Bug Report Triage 🤖',
      emoji: true,
    }),
    Blocks.Section({
      text: '🙏🏻 Thanks for reporting this bug! In order to help *Engineering* swiftly address this issue, I\'ll ask you a few more questions.',
    }),
    cta(),
  ];

  if (filesAsSlackElements.length) {
    blocks.push(Blocks.Divider());

    // add images as context section
    const uploadElements = filesAsSlackElements.concat(`*${filesAsSlackElements.length}* uploads included.`);
    blocks.push(Blocks.Context().elements(uploadElements));

    blocks.push(Blocks.Section({
      text: 'ℹ️ *TIP:* new images you reply will be uploaded to this bug report.',
    }));
  }

  return Message()
    .text('Add details to your bug report')
    .blocks(blocks);
}
