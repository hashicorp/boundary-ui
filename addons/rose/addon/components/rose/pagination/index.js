import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class RosePaginationComponent extends Component {
  @service router;

  /**
   * Returns the query params needed for the pagination component.
   * @returns {function(number, number): {pageSize: number, page: number}}
   */
  get paginationQueryParams() {
    return (page, pageSize) => {
      return {
        page,
        pageSize,
      };
    };
  }
}
