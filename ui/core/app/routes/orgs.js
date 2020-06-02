import Route from '@ember/routing/route';
import BreadCrumbRoute from 'rose/mixins/bread-crumb-route';

export default class OrgsRoute extends Route.extend(BreadCrumbRoute) {
  breadCrumb = 'Orgs';
}
