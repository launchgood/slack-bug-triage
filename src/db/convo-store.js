import BugReport from '../models/bug-report';

class ConvoStore {
  constructor() {
    this.db = {};
    this.byViewId = {};
  }

  get(id) {
    return this.db[id];
  }

  save(bugReport) {
    const { id } = bugReport;
    if (!id) {
      throw new Error('Could not generate ID for convo');
    }
    this.db[id] = bugReport;
  }

  associateView(viewId, convo) {
    this.byViewId[viewId] = convo;
  }

  findByViewId(viewId) {
    return this.byViewId[viewId];
  }

  findForEvent(event) {
    const id = BugReport.buildId(event);
    return this.db[id];
  }

  findForActionId(actionId) {
    const firstIndex = actionId.indexOf('.');
    if (firstIndex === -1) {
      throw new Error(`Could not parse ts with id ${actionId}`);
    }
    const id = actionId.substring(firstIndex + 1);
    return this.db[id];
  }

  // delete(convo) {
  //   // TODO: implement delete or close method to finalize
  // }
}

const convoStore = new ConvoStore();

// eslint-disable-next-line import/prefer-default-export
export default convoStore;
