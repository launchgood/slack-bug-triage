import BugReport from '../models/bug-report';

class ConvoStore {
  constructor() {
    this.db = {};
    this.byUserId = {};
    this.byViewId = {};
  }

  get(id) {
    return this.db[id];
  }

  save(convo) {
    const { id, userId } = convo;
    if (!id) {
      throw new Error('Could not generate ID for convo');
    }
    if (!userId) {
      throw new Error('No userId set on convo');
    }
    this.db[id] = convo;
    this.byUserId[convo.userId] = this.byUserId[convo.userId] || [];
    this.byUserId[convo.userId].push(id);
    // keep track of multiple converstions for a single user (unique list of convo IDs)
    this.byUserId[convo.userId] = this.byUserId[convo.userId].filter(
      (value, index, arr) => arr.indexOf(value) === index,
    );
  }

  associateView(viewId, convo) {
    this.byViewId[viewId] = convo;
  }

  findByUserId(userId) {
    // TODO: handle multiple in progress
    const convos = this.byUserId[userId];
    if (!convos || !convos.length) {
      return null;
    }
    const [convo] = convos;
    return convo;
  }

  findByViewId(viewId) {
    return this.byViewId[viewId];
  }

  findForEvent(event) {
    const id = BugReport.buildId(event);
    return this.db[id];
  }

  // delete(convo) {
  //   // TODO: implement delete or close method to finalize
  // }
}

const convoStore = new ConvoStore();

// eslint-disable-next-line import/prefer-default-export
export default convoStore;
