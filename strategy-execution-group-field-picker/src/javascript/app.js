Ext.define("TSStrategyExecutionProjectPicker", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    integrationHeaders : {
        name : "TSStrategyExecutionProjectPicker"
    },
                        
    launch: function() {
        
        var groups = [],
            group_setting = this.getSetting('projectGroups');
        if (!Ext.isArray(group_setting)){
            groups = Ext.JSON.decode(group_setting);
        } else {
            groups = group_setting;
        }
        
        var html_array = Ext.Array.map(groups, function(group){
            return Ext.String.format("<strong>{0}</strong>: {1} ({2}) .. {3} ({4})",
                group.groupName, 
                group.strategyProjectName, group.strategyProjectRef,
                group.executionProjectName, group.executionProjectRef
            );
        });
        
        this.add({xtype:'container',margin: 5, html:html_array.join('<br/>')});
        
        
    },
    
    getSettingsFields: function() {
        return [{
            name: 'projectGroups',
            xtype:'tsstrategyexecutiongroupsettingsfield'
        }];
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
