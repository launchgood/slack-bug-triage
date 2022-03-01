import { DateTime } from 'luxon';
import { Elements } from 'slack-block-builder';

class BugReport {
  constructor(event) {
    this.parentEvent = event;
    this.userId = this.parentEvent.user;
    this.greetEvent = null;

    this.userProfile = null;

    this.device = {
      browser: '',
      os: '',
      type: '',
    };

    this.basics = {
      steps: '',
      behaviorActual: '',
      behaviorExpected: '',
    };

    this.title = '';

    this.files = [];

    this.permalink = null;

    this.githubIssue = null;
  }

  get id() {
    return BugReport.buildId(this.parentEvent);
  }

  toJSON() {
    const {
      userId,
      parentEvent,
      greetEvent,
      userProfile,
      device,
      basics,
      body,
      title,
      files,
      permalink,
      githubIssue,

    } = this;
    return {
      userId,
      parentEvent,
      greetEvent,
      userProfile,
      device,
      basics,
      body,
      title,
      files,
      permalink,
      githubIssue,
    };
  }

  get githubMarkdown() {
    return `

## 🪲  Bug Basics

### 🗺  Steps to Reproduce

${this.basics.steps}


### 🪰  Actual Behavior

_What they actually experienced:_

${this.basics.behaviorActual}


### 🎯  Expected Behavior

_What they expected to happen:_

${this.basics.behaviorExpected}


## 📸 Screenshots

${this.filesMarkdown}


## About

[Reported on Slack by ${this.userProfile.real_name}](${this.permalink})

- Device: ${this.deviceTypeIcon} ${this.device.type}
- OS: ${this.osIcon} ${this.device.os}
- Browser: ${this.device.browser}

`;
  }

  get deviceTypeIcon() {
    return this.device.browser === 'desktop' ? '🖥' : '📱';
  }

  get osIcon() {
    switch (this.device.os) {
      case 'macos':
        return '🍎';
      case 'windows':
        return '🪟';
      default:
        return '🐧';
    }
  }

  get filesMarkdown() {
    // TODO: this is not working for some reason
    // eslint-disable-next-line max-len
    // return this.files.map((file) => `![Slack File ID ${file.id}](${file.imageUrl})`).join('\n\n');
    return this.files.map((file) => `- ${file.imageUrl}`).join('\n');
  }

  get filesAsSlackElements() {
    return this.files.map((file) => {
      const {
        altText,
        imageUrl,
      } = file;
      return Elements.Img({
        altText,
        imageUrl,
      });
    });
  }

  get relativeTime() {
    return DateTime.fromSeconds(parseInt(this.parentEvent.ts, 10)).toRelative();
  }
}

BugReport.buildId = function buildId(parentEvent) {
  return `${parentEvent.thread_ts || parentEvent.ts}`;
};

BugReport.build = (data) => {
  const { parentEvent } = data;
  if (!parentEvent) {
    throw new Error('Cannot instantiate BugReport without parentEvent');
  }
  const report = new BugReport(parentEvent);
  Object.keys(data)
    .forEach((key) => {
      report[key] = data[key];
    });
  return report;
};

export default BugReport;
