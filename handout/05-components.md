# Part 5: Getting Started with the Client

This course will be organized around building a collaborative task manager. We
will start by building a client app, which we will later connect to a REST
API. Our first task is to setup a simple Angular app consisting of a few
*components*, and to understand how they fit together. We'll be making use of common built-in directives such as `ng-model`, `ng-show`, `ng-hide`, `ng-cloak`, `ng-if`, `ng-repeat`. We will also discuss Angular’s dependency injection and the use of `$log` for logging.

## The Most Trivial Angular App

Let's start by setting up a really simple angular app -- so simple in fact
that it won't do anything at all. Here is what we'll put in our HTML file.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/bower_components/traceur-runtime/traceur-runtime.js"></script>
    <script src="/bower_components/es6-module-loader/dist/es6-module-loader.js"></script>
    <script src="/bower_components/system.js/dist/system.js"></script>
    <script src="/bower_components/angular/angular.js"></script>
  </head>
  <body>
    <div>
        Hello World!
    </div>
    <script>
      System.baseURL = '/dist/';
      System.defaultJSExtensions = true;
      System.import('app');
    </script>
  </body>
</html>
```

We'll also need a very simple TypeScript file - our "app":

```typescript
/// <reference path="../../typings/angularjs/angular.d.ts" />
'use strict';

angular.module('ngcourse', []);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['ngcourse']);
});
```

## Defining Components

This app doesn't do anything at all. To make it do something remotely interesting we'll need to define a component. 

## ...But What is a Component?

Component is an object that structures and represents a UI element. It consists of two parts, component **controller** and component **template**.

With that in mind let's define a basic component in a separate typescript file in *components/main/main-component.ts*:

```typescript
  import {makeComponent} from 'utils/component-maker';

  const template = `
    <div>
      <span>
        Hello, {{ ctrl.username }}!
        You've got {{ ctrl.numberOfTasks }} tasks.
      </span>
    </div>
  `;

  class MainCtrl {
    username: any;
    numberOfTasks: any;

    constructor() { 
      this.username = 'alice';
      this.numberOfTasks = 0;
    }
  };

  export var MainComponent = makeComponent(
    template,
    MainCtrl,
    {}
  );
```

### Component Template
The template of a component is just an HTML snippet defining a view that represent this component. Templates have access to any properties or functions defined on the component's controller.

### Component Controller
The component controller is just an ES6 class that backs component's view represented by a template. The template above binds the `username` and 
`numberOfTasks` properties defined on the `MainCtrl` controller class using the `{{ ctrl.username }}` and `{{ ctrl.numberOfTasks }}`, refered to as the double-mustache syntax.

## Using Components in your Angular 1.x Application

In the previous section we learned how to define a component, now we need to use this component within our Angular 1.x application context.

Lets change our *app.ts* and let Angular know about our component via the `.directive()` function.

```typescript
...
angular.module('ngcourse', [])
  .directive('ngcMain', MainComponent);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['ngcourse']);
});
```

We can now use this component in our *index.html* as follows:

```html
  <body>
    <ngc-main></ngc-main>
    ...
  </body>
```

Note that we used "camelCase" when we defined this component in our Angular application, but we used hyphens when inserting them into the HTML.

Angular will figure out that `<ngc-main></ngc-main>` refers to the component that we defined as "ngcMain".

## Handling Events with Components

If we put functions onto the component's scope, we can attach those functions to DOM events.

Let's add a `addTask()` function to our `MainCtrl` class:

```typescript
  ...
  class MainCtrl {

    ...

    addTask() {
      this.numberOfTasks += 1;
    }
  };
  ...
```

We need to modify our component's template and add a button element with an `addTask()` function attached to it's click event:

```html
  <div>
    <span>
      Hello, {{ ctrl.username }}!
      You've got {{ ctrl.numberOfTasks }} tasks.
      <button ng-click="ctrl.addTask()">Add task</button>
    </span>
  </div>
```

## A Look at Dependency Injection (DI)

Dependency Injection (DI) is a design pattern that allows software components to get references to their dependencies. DI allows to structure software in a way where components are decoupled from each other. This results in modular software structure with independent components which are much more unit-test friendly.

### Injecting Dependencies into Components

Let's start with injecting Angular's `$log` service into our component:

```typescript
  ...
  class MainCtrl {
    $log: any;
    ...

    constructor( $log ) { 
      this.$log = $log;
      ...
    }

    addTask() {
      this.$log.debug('Current number of tasks:', this.numberOfTasks);
      this.numberOfTasks += 1;
    }
  };
  MainCtrl.$inject = ['$log'];
  ...
```

In the code above we are injecting a `$log` service into our component by adding `$inject` property to it's controller class. The reference to `$log` is available in the constructor where we are storing  it in a `this.$log` variable for access within the scope of the class.

### Injecting Multiple Dependencies

This:

```typescript
  ...
  class MainCtrl {
    ...
    constructor($log, $scope) { 
    ...
  };
  MainCtrl.$inject = ['$log', '$scope'];
  ...
```

is equivalent to this (Don't do this!):

```typescript
  ...
  class MainCtrl {
    ...
    constructor($a, $b) { 
    ...
  };
  MainCtrl.$inject = ['$log', '$scope'];
  ...
```

But this:

```typescript
  ...
  class MainCtrl {
    ...
    constructor($scope, $log) { 
    ...
  };
  MainCtrl.$inject = ['$log', '$scope'];
  ...
```

Will not work at all. 

In short, the order of parameters in the `$inject` property relative to the class constructor is important.

### Utility Method for Dependency Injection

To simplify DI within our code we can use a utility function provided in `utils/di.ts` file as follows:

```typescript
  ...
  class MainCtrl {
    $log: any;
    ...

    constructor(@Inject('$log') $log) { 
      this.$log = $log;
      ...
    }

    addTask() {
      this.$log.debug('Current number of tasks:', this.numberOfTasks);
      this.numberOfTasks += 1;
    }
  };
  ...
```

## Two-Way Binding with `ng-model`

We can also control our component's property value from within the HTML.
Modify the template of of our component to include the following:

```html
  <div>
    Enter username: <input ng-model="ctrl.username"/>
    <br/>
    <span>
      Hello, {{ ctrl.username }}!
      You've got {{ ctrl.numberOfTasks }} tasks.
      <button ng-click="ctrl.addTask()">Add task</button>
    </span>
  </div>
```

In the above example, the `ng-model` directive bi-directionaly binds an element to our component controller's property. Note that if the property does not exist on the controller, it will be created.

## Implementing "Login"

Let's modify our component's template to hide the login form upon login and show the task counter.

```html
  <div>
    <div ng-hide="ctrl.isAuthenticated">
      Enter username: <input ng-model="ctrl.username"/><br/>
      Password: <input type="password" ng-model="ctrl.password"/><br/>
      <button ng-click="ctrl.login()">Login</button>
    </div>
    <div ng-show="ctrl.isAuthenticated">
      Hello, {{ ctrl.username }}!
      You've got {{ ctrl.numberOfTasks }} tasks<br/>
      <button ng-click="ctrl.addTask()">Add task</button>
    </div>
  </div>
```

We'll also need to modify our component's controller as follows:

```typescript
  class MainCtrl {
    $log: any;
    isAuthenticated: any;
    numberOfTasks: any;

    constructor( @Inject('$log') $log ) { 
      this.$log = $log;
      this.numberOfTasks = 0;
      this.isAuthenticated = false;
    }

    login() {
      this.isAuthenticated = true;
    }

    addTask() {
      this.$log.debug('Current number of tasks:', this.numberOfTasks);
      this.numberOfTasks += 1;
    }

  };
```

## Splitting Up the Components

By this point our component is getting unweildy. Let's split it into two separate components. 

The first component will be located in `components/task-list/task-list-component.ts` and will implement our simple task counter.

```typescript
  import {Inject} from 'utils/di';
  import {makeComponent} from 'utils/component-maker';

  let template = `
    Hello, {{ ctrl.username }}!
    You've got {{ ctrl.numberOfTasks }} tasks<br/>
    <button ng-click="ctrl.addTask()">Add task</button>
  `;

  export class TaskListCtrl {
    $log: any;
    numberOfTasks: any;

    constructor( @Inject('$log') $log ) {
      this.$log = $log;
      this.numberOfTasks = 0;
    }

    addTask() {
      this.$log.debug('Current number of tasks:', this.numberOfTasks);
      this.numberOfTasks += 1;
    }

  };

  export var TaskListComponent = makeComponent(
    template,
    TaskListCtrl,
    {
      scope: {}
    }
  );
```

The second component will be located at `components/main/main-component.ts` and will be responsible for user authentication. 

```typescript
  import {makeComponent} from 'utils/component-maker';
  import {Inject} from 'utils/di';

  const template = `
    <div>
      <div ng-hide="ctrl.isAuthenticated">
        Enter username: <input ng-model="ctrl.username"/><br/>
        Password: <input type="password" ng-model="ctrl.password"/><br/>
        <button ng-click="ctrl.login()">Login</button>
      </div>
      <div ng-show="ctrl.isAuthenticated">
        <ngc-task-list></ngc-task-list>
      </div>
    </div>
  `;

  class MainCtrl {
    $log: any;
    isAuthenticated: any;

    constructor( @Inject('$log') $log ) { 
      this.$log = $log;
      this.isAuthenticated = false;
    }

    login() {
      this.isAuthenticated = true;
    }

  };

  export var MainComponent = makeComponent(
    template,
    MainCtrl,
    {}
  );
```

The last thing remaining is to wire up our new component within Angular application context.

```typescript
  ...
  import {MainComponent} from 'components/main/main-component';
  import {TaskListComponent} from 'components/task-list/task-list-component';

  angular.module('ngcourse', [])
    .directive('ngcMain', MainComponent)
    .directive('ngcTaskList', TaskListComponent);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['ngcourse']);
  });
```

## Application Structure with Components

A useuful way of conceptualizing Angular application design is to look at it as a tree of nested components each having an isolated scope. 

Let's try adding another `<ngc-task-list></ngc-task-list>` element to the template of a component we defined in *components/main/main-component.ts* and observe what happens in the browser.

## Component Communication

In general, component communication is better achieved via services and/or publish/subscribe methods. Those approached will be covered in detail in the upcoming sections and for now we will take a direct approach.

### Passing Data Between Components

We have introduce a bug during our re-factoring, the username is not displayed when  `TaskListComponent` is shown. Let's modify *task-list-component.ts* and fix it:

```typescript
  ...
  export var TaskListComponent = makeComponent(
    template,
    TaskListCtrl,
    {
      scope: {
        username: '=username'
      }
    }
  );
```

and in *main-component.ts* let's change our template as follows:

```html
  ...
  <ngc-task-list username="ctrl.username"></ngc-task-list>
  ...
```

Now the `username` property is passed from `MainComponent` to `TaskListComponent`.

### Responding to Component Events

Let's restructure our code further and create a new component to handle the login form for us. We will put this component in a new file *components/login-form/login-form-component.ts*:

```typescript
  import {makeComponent} from 'utils/component-maker';

  let template = `
    Enter username: <input ng-model="ctrl.username"/><br/>
    Password: <input type="password" ng-model="ctrl.password"/><br/>
    <button ng-click="ctrl.login()">Login</button>
  `;

  class LoginFormController {
    username: any;
    password: any;
    onSubmit: Function;

    constructor() { 
      this.username = "";
      this.password = "";
    }

    login() {
      var data = {
        username: this.username,
        authenticated: true
      };
      
      this.onSubmit({data});
    }
  }

  export var LoginFormComponent = makeComponent(
    template,
    LoginFormController,
    {
      scope: {}
    }
  );
```

Let's change *main-component.ts* to accomodate this change:

```typescript
  ...
  const template = `
    <div>
      <div ng-hide="ctrl.isAuthenticated">
        <ngc-login-form on-submit="ctrl.loginHandler(data)"></ngc-login-form>
      </div>
      <div ng-show="ctrl.isAuthenticated">
        <ngc-task-list username="ctrl.username"></ngc-task-list>
      </div>
    </div>
  `;

  class MainCtrl {
    $log: any;
    isAuthenticated: any;
    username: any;

    constructor( @Inject('$log') $log ) { 
      this.$log = $log;
      this.isAuthenticated = false;
    }

    loginHandler(data) {
      this.isAuthenticated = data.authenticated;
      this.username = data.username;
    }

  };
  ...
```

The reponsibility of our `MainComponent` has changed after re-factoring. Let's rename it to `AuthenticationComponent`, it's controller class to `AuthenticationCtrl` and the selector in *app.ts* to `ngcAuthenticator`.

## Iteration with `ng-repeat`

When we have a list of items, we can use `ng-repeat` within our component's template to create identical DOM for each item.

Let's modify the temaplate in *task-list-component.ts*

```html
  Hello, {{ ctrl.username }}!
  You've got {{ ctrl.tasks.length }} tasks<br/>
  <button ng-click="ctrl.addTask()">Add task</button>

  <table>
    <tr>
      <th>Owner</th>
      <th>Task description</th>
    </tr>
    <tr ng-repeat="task in ctrl.tasks">
      <td>{{task.owner}}</td>
      <td>{{task.description}}</td>
    </tr>
  </table>
```

In the TaskListCtrl all we do is set `tasks` to an array:

```typescript
export class TaskListCtrl {
  $log: any;
  tasks: any;

  constructor( @Inject('$log') $log ) {
    this.$log = $log;

    this.tasks = [
      {
        owner: 'alice',
        description: 'Build the dog shed.'
      },
      {
        owner: 'bob',
        description: 'Get the milk.'
      },
      {
        owner: 'alice',
        description: 'Fix the door handle.'
      }
    ];
  }

  addTask() { }

};
```

Note that in the template of this component we also change `{{ ctrl.numberOfTasks }}` to `{{ ctrl.tasks.length }}`.

## Transclusion with `ng-transclude`

## Adding "Watchers" (Do we still need this?)

Our controller can get alerted if the value on the component controller's scope changes:

```typescript
class MainCtrl {
  $log: any;
  $scope: any;
  ...
  constructor(
    @Inject('$log') $log, 
    @Inject('$scope') $scope
  ) { 
    this.$log = $log;
    this.$scope = $scope;
    ...
    this.$scope.$watch('ctrl.username', (newValue, oldValue) => {
      this.$log.info(newValue, oldValue);
    });
  }
  ...
};
```

However: *this is rarely useful*. We'll see better ways of handling such
things.

## Broadcasting and Catching Events.

Angular provides a system for broadcasting events and listening to them. This
system is tied to scopes. Use `$scope.$on` to subscribe to messages. The method used for sending messages depends on whether we want to communicate *up* or *down* the scope.

Let's use `$scope.$broadcast` to send a message *down* the scope system. We'll
put this in `main-controller.js`:

```javascript
  .controller('MainCtrl', function($scope, $log) {
    $scope.isAuthenticated = false;
    $scope.messageChild = function() {
      $scope.$broadcast('hello.child', {fruit: 'peaches'});
    };
  });
```

We'll subscribe to this message in `task-list-controller.js` using `$scope.$on`.

```javascript
  .controller('TaskListCtrl', function($scope, $log, $window) {
    $scope.$on('hello.child', function(event, payload) {
      $window.alert(payload.fruit);
    });
  });
```

To communicate *up* the scope, we use `$emit` instead of `$broadcast`.

```javascript
  .controller('TaskListCtrl', function($scope, $log, $window) {
    $scope.messageParent = function() {
      $scope.$emit('hello.parent', {animal: 'turtle'})
    };
  });
```

## Using `$apply` and `$timeout`.

We saw this example before when using the console:

```javascript
  $scope.numberOfTasks = 42;  // angular.element($0).scope();
  $scope.$apply();
```

We had to use `$scope.$apply` to make the update to the scope reflected in the
UI. In practice, however, you will only *very rarely* have a good reason to
use `$apply`.

To understand why `$apply` is rarely needed, let's talk a bit about Angular's
"digest cycle".

Developers somtimes use `$apply` is to "apply" changes to the scope introduced
in a function called inside `setTimeout()`. A better solution, however, is to
never use `setTimeout()` in your Angular code.

Instead, use `$timeout()`, which will call `$apply()` for you.

```js
  $timeout(function() {
    // This code will run after the current digest cycle (if any) completes.
    // When this function returns, another digest cycle will run.
  });
```

In fact, most things that can be achieved with `$apply` are better done with
`$timeout`.

## Angular's Nested Scope System Considered Harmful

Angular's nested scope make it easy to setup controller-to-controller
communication. There are three problems with this, however.

1. The nested scope system is counterintuitive and hard to debug.
2. Improper use of scope as a communication can lead to performance problems.
3. Your controllers shouldn't be talking to each other directly in the first
   place.

Of those three, the third one is often the least appreciated, but it is
actually the most important. Let's talk more about it.

Consequently, we recommend avoiding the use of `$scope` altogether.

## `$rootScope`

All Angular scopes are nested inside `$rootScope`. This means
`$rootScope.$broadcast` allows you to send messages to all scopes. This is
tempting, but it's rarely a good idea. Say no to `$rootScope`.

Unlike individual scopes, which are only available inside controllers and
directives, `$rootScope` can be dependency-injected into services. This may
seem like a reason to use it, but it's actually another reason to avoid it.

## The "Controller As" Pattern

Gives a controller's scope a name and refer to its properties using this name:

```html
  <div ng-controller="MainCtrl as main">

    <div ng-hide="main.isAuthenticated" ng-controller="LoginFormCtrl as loginForm">
      Enter username: <input ng-model="loginForm.username"/><br/>
      Password: <input type="password" ng-model="loginForm.password"/><br/>
      <div ng-show="main.errorMessage">{{ main.errorMessage}}</div>
      <button ng-click="main.login(loginForm.username, loginForm.password)">Login</button>
    </div>

    <div ng-show="main.isAuthenticated">
      Hello, {{main.username}}!
    </div>

    <div ng-show="main.isAuthenticated" ng-controller="TaskListCtrl as taskList">
      {{main.username}}, you've got {{taskList.numberOfTasks}} tasks<br/>
      <button ng-click="taskList.addTask()">Add task</button>
    </div>

  </div>
```

We'll also need to change our controllers. First, `MainCtrl`:

```javascript
  .controller('MainCtrl', function($log) {
    var vm = this;
    vm.isAuthenticated = false;
    vm.login = function(username, password) {
      vm.isAuthenticated = true;
      vm.username = username;
      vm.password=password;
    };
  });
```

Then `TaskListCtrl`:

```javascript
  .controller('TaskListCtrl', function($log) {
    var vm = this;
    vm.numberOfTasks = 0;
    vm.addTask = function() {
      vm.numberOfTasks += 1;
    };
  });
```

And a trivial `LoginFormCtrl`:

```javascript
  .controller('LoginFormCtrl', function() {
    // Let's do nothing for now.
  });
```

## What's in $scope Now?

Note that $scope is still injectable!

```javascript
  .controller('TaskListCtrl', function($scope, $log) {
    $log.debug('$scope:', $scope);
    var vm = this;
    $scope.numberOfTasks = 0;
    vm.addTask = function() {
      vm.numberOfTasks += 1;
    };
  });
```

Consider not using $scope, though.

## Next Steps

Enough controllers for now. That not where your code should go in most cases!
Our next step will be to look at how to organize our code with using services.
