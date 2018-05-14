(function(){

    // $.fn.serializeObject = function() {
    //     var o = {};
    //     var a = this.serializeArray();
    //     $.each(a, function() {
    //         if (o[this.name] !== undefined) {
    //             if (!o[this.name].push) {
    //                 o[this.name] = [o[this.name]];
    //             }
    //             o[this.name].push(this.value || '');
    //         } else {
    //             o[this.name] = this.value || '';
    //         }
    //     });
    //     return o;
    //   };

    if(!localStorage.getItem('todosCounter'))
        localStorage.setItem('todosCounter', 0);

    var db = {};
    db.todos = [];    
  
    /**
     * This will create a fuction to override the default backbone sync function
     * Localstorage is used to store the data.
     * @param {*} key 
     */
    function createLocalStorageSyncFn(key){
        return function syncTolocalStorage(method, model, options) {            
                try{

                    switch(method) {
                        case 'read':
                            if(model.id){
                                var data = db[key].find(obj => obj.id == model.id) ;                                
                                if(data) 
                                    model.set(data);                                
                                else
                                    throw "Data not found for key: "+key + " id: "+ model.id;
                            }else{
                                model = JSON.parse(localStorage.getItem(key)) || [];    
                                db[key] = model;                        
                               
                            }                            
                            break;
                        case 'update':
                            db[key][model.id] = model.toJSON();
                            localStorage.setItem(key, JSON.stringify(db[key])); 
                            break;
                        case 'create':
                            var idCounter = Number(localStorage.getItem(key+'Counter'));
                            model.set('id', idCounter);
                            db[key].push(model.toJSON());                            
                            localStorage.setItem(key+'Counter', idCounter+1);                                                        
                            localStorage.setItem(key, JSON.stringify(db[key]));                            
                            break;
                        case 'delete':
                            db[key] =  db[key].filter(obj => obj.id !== model.id ) ;
                            localStorage.setItem(key, JSON.stringify(db[key])); 
                        }
                        options.success(model || {});               
   
                }catch(e){
                    console.error(e);
                    options.error();
                    console.error('error during sync', e, arguments);
                }
            };
    }

    var TodoApp = new Backbone.Marionette.Application();

    var Todo = Backbone.Model.extend({
        sync: createLocalStorageSyncFn('todos'),
        url : 'todos'
    });
    
    var Todos = Backbone.Collection.extend({
        model: Todo ,
        sync: createLocalStorageSyncFn('todos'),
        url : 'todos',
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
       
        initialize: function(options){
            this.collection.fetch();
        }
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
            this.collection.create({
                task: this.ui.task.val()
            });
           
            this.ui.task.val('');
        }
    });

    TodoApp.addRegions({
        form: '#form',
        list: '#list'
    });

    TodoApp.addInitializer(function(){
        TodoApp.todos = new Todos();
        TodoApp.form.show(new FormView({collection: TodoApp.todos}));
        TodoApp.list.show(new TodosView({collection: TodoApp.todos}));
        
    });

    TodoApp.on('start', function(options) {
        Backbone.history.start({pushState: false}); 
      });


    TodoApp.start();
})();
