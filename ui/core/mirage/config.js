import config from '../config/environment';
import { Response } from 'miragejs';

export default function() {

  // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.urlPrefix = '';
  // make this `/api`, for example, if your API is namespaced
  this.namespace = config.api.namespace;
  // delay for each request, automatically set to 0 during testing
  this.timing = 350;

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    https://www.ember-cli-mirage.com/docs/route-handlers/shorthands
  */

  if (config.api.host) this.passthrough(`${config.api.host}/**`);
  this.passthrough();

  this.get('/orgs/:org_id/projects');
  this.post('/orgs/:org_id/projects');
  this.get('/orgs/:org_id/projects/:id');
  this.patch('/orgs/:org_id/projects/:id', () => {
    // return new Response(400, {}, {
    //   "status": 400,
    //   "code": "invalid_argument",
    //   "message": "The request contained invalid fields.",
    //   "details": {
    //     "request_id": "abc123",
    //     "TraceId": "0123-4567",
    //     "fields": [
    //       {
    //         "name": "name",
    //         "message": "name is required"
    //       },
    //       {
    //         "name": "description",
    //         "message": "The description must not be more than 1 trillion characters long."
    //       }
    //     ]
    //   }
    // });

    return new Response(409, {}, {
      "status": 409,
      "code": "invalid_argument",
      "message": "The request was awful."
    });
  });
  this.del('/orgs/:org_id/projects/:id');
}
