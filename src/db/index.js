import BugReportStore from './bug-report-store';

// eslint-disable-next-line import/no-mutable-exports
const dbWrapper = {};

export function initDb(connectionUrl, logger) {
  dbWrapper.db = new BugReportStore(connectionUrl, logger);
  return dbWrapper.db;
}

export { BugReportStore };

export default function db() {
  return dbWrapper.db;
}
