import { getOwner, setOwner } from '@ember/owner';

export default class SqliteHandler {
  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
    switch (context.request.op) {
      case 'query': {
        return next(context.request);
      }
      default:
        return next(context.request);
    }
  }
}
