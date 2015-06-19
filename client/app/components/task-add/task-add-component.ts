import {Inject, getServices} from 'utils/di';
import {makeComponent} from 'utils/component-maker';

let template = `
  <input ng-model="newTask.owner" placeholder="Owner"/> <br/>
  <input ng-model="newTask.description" placeholder="Description"/><br/>
  <button ng-click="ctrl.save(newTask)">Save</button>
  <button ng-click="ctrl.cancel()">Cancel</button>
`;

export class TaskAddCtrl {
  services: any;
  cancel: any;
  
  constructor(
    @Inject('$log') $log,
    @Inject('router') router,
    @Inject('tasks') tasks
   ) {
    this.services = getServices(this.constructor, arguments);
    this.cancel = this.services.router.goToTaskList.bind(this.services.router);
  }

  save(task) {
    return this.services.tasks.addTask(task)
      .then(() => this.services.router.goToTaskList())
      .then(null, this.services.$log.error);
  };
};

export var TaskAddComponent = makeComponent(
  template,
  TaskAddCtrl,
  {
    scope: {}
  }
);