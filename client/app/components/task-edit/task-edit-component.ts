import {Inject, getServices} from 'utils/di';
import {makeComponent} from 'utils/component-maker';

let template = `
  <input ng-model="ctrl.task.owner" placeholder="Owner" /> <br/>
  <input ng-model="ctrl.task.description" placeholder="Description"/> <br/>
  <button ng-click="ctrl.updateTask(ctrl.task)">Update</button>
  <button ng-click="ctrl.cancel()">Cancel</button>
`;

export class TaskEditCtrl {
  services: any;
  cancel: any;
  task: any;

  constructor(
    @Inject('$http') $http,
    @Inject('$log') $log,
    @Inject('tasks') tasks,
    @Inject('$stateParams') $stateParams,
    @Inject('router') router
  ) {
    this.services = getServices(this.constructor, arguments);
    this.services.tasks.getTask(this.services.$stateParams._id)
      .then((response) => this.task = response)
      .then(null, this.services.$log.error);

    this.cancel = this.services.router.goToTaskList.bind(this.services.router);
  }

  updateTask(task) {
    this.services.tasks.updateTask(task)
      .then(this.services.router.goToTaskList.bind(this.services.router))
      .then(null, this.services.$log.error);
  }
};

export var TaskEditComponent = makeComponent(
  template,
  TaskEditCtrl,
  {
    scope: {}
  }
);