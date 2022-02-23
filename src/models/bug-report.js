export default class BugReport {
  constructor(userId, event) {
    this.userId = userId;
    this.parentEvent = event;
    // this.lastActionId =

    this.body = event.text;
    this.title = '';

    this.device = {
      browser: '',
      type: '',
      os: '',
    };

    this.basics = {
      steps: '',
      behaviorActual: '',
      behaviorExpected: '',
    };

    this.screenshots = [];

    // https://docs.github.com/en/rest/reference/issues#get-an-issue
    this.issue = null;
    /* {
      "id": 1,
      "node_id": "MDU6SXNzdWUx",
      "number": 1347,
      "state": "open",
      "title": "Found a bug",
      "body": "I'm having a problem with this.",
      "labels": []
    } */
  }

  get id() {
    return BugReport.buildId(this.userId, this.parentEvent);
  }
}

BugReport.buildId = function buildId(userId, parentEvent) {
  return `${userId}-${parentEvent.ts}`;
};
