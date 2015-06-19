import {Inject, getServices} from 'utils/di';
import {makeComponent} from 'utils/component-maker';

let template = `
<div>
  {{main.userDisplayName}}, we've got {{ctrl.tasks.length}} tasks
  <br/>

  <div ui-view="actionArea"></div>
  <table>
    <tr>
      <th>Owner</th>
      <th>Task description</th>
    </tr>
    <tr ng-repeat="task in ctrl.tasks">
      <td>{{ctrl.getUserDisplayName(task.owner)}}</td>
      <td>{{task.description}}</td>
      <td><a ng-show="task.can.edit" ui-sref="tasks.details({_id: task._id})">edit</a>
      </td>
    </tr>
  </table>
</div>
`;

export class TaskListCtrl {
  services: any;
  tasks: any;
  addTask: any;
  getUserDisplayName: any;

  constructor(
    @Inject('$log') $log,
    @Inject('tasks') tasks,
    @Inject('users') users,
    @Inject('router') router
  ) {
    this.services = getServices(this.constructor, arguments);
    this.tasks = [];
    this.addTask = this.services.router.goToAddTask.bind(this.services.router);
    this.getUserDisplayName = this.services.users.getUserDisplayName.bind(this.services.users);
    this.loadInitialTasks();
  }

  loadInitialTasks() {
    let tasks;
    this.services.tasks.getTasks()
      .then(newTasks => tasks = newTasks)
      .then(() => this.services.users.whenReady())
      .then(() => this.tasks = tasks)
      .then(null, this.services.$log.error);
  }

  // get addTask() { return this.services.router.goToAddTask; }
};

export var TaskListComponent = makeComponent(
  template,
  TaskListCtrl,
  {
    scope: {}
  }
);