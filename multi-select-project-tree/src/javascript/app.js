Ext.define("TSMultiProjectTreeSelector", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    integrationHeaders : {
        name : "TSMultiProjectTreeSelector"
    },

    projects: [],
    
    stateful: true,
    stateId: 'TSMultiProjectTreeSelector.1',
    
    getState: function() {
        console.log(this.projects);
        return {
            projects: this.projects
        };
    },

    applyState: function(state) {
        console.log('state', state);
        this.callParent(arguments);
        if(state.hasOwnProperty('projects')) {
            this.projects = state.projects;
        }
    },
    
    launch: function() {
        this.logger.log('projects:', this.projects);
        
        Ext.create('CA.technicalservices.ProjectTreePickerDialog',{
            autoShow: true,
            title: 'Choose Project(s)',
            initialSelectedRecords: this.projects,
            multiple: false,
            leavesOnly: true,
            introText: 'Some text here',
            listeners: {
                scope: this,
                itemschosen: function(items){
                    // save the data rep of each project (because preferences can
                    // choke on an an instantiated class
                    this.projects = Ext.Array.map(items, function(item){
                        if ( Ext.isFunction(item.getData) ) {
                            item = item.getData();
                        }
                        return item;
                    });
                    
                    this.logger.log("selected: ", items);
                    this.logger.log('--', this.projects);
                    this.saveState();
                }
            }
        });
    },
      
    _loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID']
        };
        this.logger.log("Starting load:",config.model);
        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },

    _loadAStoreWithAPromise: function(model_name, model_fields){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        this.logger.log("Starting load:",model_name,model_fields);
          
        Ext.create('Rally.data.wsapi.Store', {
            model: model_name,
            fetch: model_fields
        }).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(this);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    _displayGrid: function(store,field_names){
        this.down('#display_box').add({
            xtype: 'rallygrid',
            store: store,
            columnCfgs: field_names
        });
    },
    
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
    
});
