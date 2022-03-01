import Redis from 'ioredis';
import BugReport from '../models/bug-report';

class BugReportStore {
  constructor(redisUrl, logger) {
    this.redisClient = new Redis(redisUrl);
    this.logger = logger;
  }

  async get(id) {
    const serialized = await this.redisClient.get(id);
    const data = JSON.parse(serialized);
    this.logger.debug(`DB: get(${id})`, data);
    if (!data) {
      return null;
    }
    return BugReport.build(data);
  }

  async save(bugReport) {
    const { id } = bugReport;
    if (!id) {
      throw new Error('Could not generate ID for convo');
    }
    this.logger.debug(`DB: save(${id})`);
    await this.redisClient.set(id, JSON.stringify(bugReport));
  }

  async associateView(viewId, bugReport) {
    this.logger.debug(`DB: associateView(${viewId} => ${bugReport.id})`);
    await this.save(bugReport);
    const { id } = bugReport;
    await this.redisClient.set(viewId, id);
  }

  async findByViewId(viewId) {
    this.logger.debug(`DB: findByViewId(${viewId})`);
    const id = await this.redisClient.get(viewId);
    if (!id) {
      return null;
    }
    return this.get(id);
  }

  async findForEvent(event) {
    this.logger.debug(`DB: findForEvent(${event.thread_ts || event.ts})`);
    const id = BugReport.buildId(event);
    return this.get(id);
  }

  async findForActionId(actionId) {
    this.logger.debug(`DB: findForActionId(${actionId})`);
    const firstIndex = actionId.indexOf('.');
    if (firstIndex === -1) {
      throw new Error(`Could not parse ts with id ${actionId}`);
    }
    const id = actionId.substring(firstIndex + 1);
    return this.get(id);
  }
}

export default BugReportStore;
