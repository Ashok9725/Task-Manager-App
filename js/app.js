(function () {
  'use strict';

  // Define AngularJS module with ngAnimate dependency
  var app = angular.module('taskApp', ['ngAnimate']);

  // Service for localStorage management
  app.factory('TaskService', ['$window', function ($window) {
    var KEY = 'taskManager.tasks.v3';

    function read() {
      try {
        var raw = $window.localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Error reading from localStorage', e);
        return [];
      }
    }

    function write(tasks) {
      try {
        $window.localStorage.setItem(KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('Error writing to localStorage', e);
      }
    }

    return {
      getAll: function () { return read(); },
      saveAll: function (tasks) { write(tasks); }
    };
  }]);

  // Controller logic
  app.controller('TaskController', ['TaskService', '$timeout', function (TaskService, $timeout) {
    var vm = this;

    // Load existing tasks or initialize empty array
    vm.tasks = TaskService.getAll() || [];
    vm.newTask = { title: '', description: '' };

    // Save tasks to localStorage
    function persist() {
      TaskService.saveAll(vm.tasks);
    }

    // Add new task
    vm.addTask = function () {
      if (!vm.newTask.title || !vm.newTask.title.trim()) return;

      var task = {
        id: Date.now(),
        title: vm.newTask.title.trim(),
        description: (vm.newTask.description || '').trim(),
        completed: false,
        created: new Date()
      };

      vm.tasks.unshift(task);
      vm.newTask = { title: '', description: '' };
      persist();
    };

    // Delete task
    vm.deleteTask = function (task) {
      var idx = vm.tasks.findIndex(function (t) { return t.id === task.id; });
      if (idx > -1) {
        vm.tasks.splice(idx, 1);
        // Delay persistence slightly to allow animation
        $timeout(function () { persist(); }, 300);
      }
    };

    // Toggle complete state
    vm.toggleComplete = function () {
      persist();
    };

    // Start editing a task
    vm.startEdit = function (task) {
      task.editing = true;
      task._editTitle = task.title;
      task._editDescription = task.description;
    };

    // Save edited task
    vm.saveEdit = function (task) {
      if (!task._editTitle || !task._editTitle.trim()) return;

      task.title = task._editTitle.trim();
      task.description = (task._editDescription || '').trim();
      task.editing = false;
      delete task._editTitle;
      delete task._editDescription;
      persist();
    };

    // Cancel edit mode
    vm.cancelEdit = function (task) {
      task.editing = false;
      delete task._editTitle;
      delete task._editDescription;
    };
  }]);
})();
