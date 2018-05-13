(function(){
    console.log('\'Allo \'Allo!');

    var ToDoApp = new Backbone.Marionette.Application();

    var Todo = Backbone.Model.extend({});
    var Todos = Backbone.Collection.extend({
        model: Todo
    });

    var TodoView = Backbone.Marionette.ItemView.extend({
        template: '#todo-view'
    });

    var NoTodosView = Backbone.Marionette.ItemView.extend({
        template: '#no-todos-view'
    });

    var TodosView = Backbone.Marionette.CollectionView.extend({
        template: '#todos-view',
        itemView: TodoView,
        // emptyView: NoTodosView
    });

    var FormView = Backbone.Marionette.ItemView.extend({
        template: '#todo-form',
        events:{
            'click button': 'createTodo'
        },
        ui: {
            task : '#task'
        },
        createTodo: function(){
            this.collection.add({
                task: this.ui.task.val()
            });
            this.ui.task.val('');
        }
    });

    ToDoApp.addRegions({
        form: '#form',
        list: '#list'
    });

    ToDoApp.addInitializer(function(){
        ToDoApp.todos = new Todos();
        ToDoApp.form.show(new FormView({collection: ToDoApp.todos}));
        ToDoApp.list.show(new TodosView({collection: ToDoApp.todos}));
        
    });

    ToDoApp.on('start', function(options) {
        Backbone.history.start({pushState: false}); 
      });


    ToDoApp.start();
})();
