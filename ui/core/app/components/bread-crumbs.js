import BreadCrumbsComponent from 'ember-breadcrumbs/components/bread-crumbs';
import { inject as service } from '@ember/service';

export default class crumbs extends BreadCrumbsComponent {

  // =services

  @service session;
  @service scope;

}
