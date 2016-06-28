Ext.define("TSAlternativeTimeline", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{user}, this is a bootstrap app for timeline.  Start: {start}, End: {end}</tpl>'},
        {xtype:'container',itemId:'display_box' }
    ],

    integrationHeaders : {
        name : "TSAlternativeTimeline"
    },
                        
    launch: function() {
        var me = this;
        this.setLoading("Loading stuff...");

        this.start = Rally.util.DateTime.add(new Date(), 'month', -18);
        this.end = Rally.util.DateTime.add(new Date(), 'month', 1);
        
        var start = Rally.util.DateTime.toIsoString(this.start);
        var end = Rally.util.DateTime.toIsoString(this.end);

        this.down('#message_box').update({
            user: this.getContext().getUser()._refObjectName,
            start: start,
            end: end 
        });
        
        var pi_config = { 
            model: 'PortfolioItem/Feature',
            filters: [{property:'PlannedStartDate', operator: '>=', value: start}],
            fetch: ['ObjectID','Name','FormattedID','PlannedStartDate','PlannedEndDate','ActualStartDate','ActualEndDate']
        };

        var release_config = { 
            model: 'Release',
            filters: [{property:'ReleaseStartDate', operator: '>=', value: start}],
            fetch: ['ObjectID','Name','FormattedID','ReleaseStartDate','ReleaseDate']
        };
        
        var iteration_config = { 
            model: 'Iteration',
            filters: [{property:'StartDate', operator: '>=', value: start}],
            fetch: ['ObjectID','Name','FormattedID','StartDate','EndDate']
        };
        
        Deft.Chain.sequence([
            function() { return me._loadWsapiRecords(pi_config); },
            function() { return me._loadWsapiRecords(release_config); },
            function() { return me._loadWsapiRecords(iteration_config); }
        ]).then({
            scope: this,
            success: function(records) {
                this._displayTimeline(Ext.Array.flatten(records));
                this.setLoading(false);
            },
            failure: function(error_message){
                alert(error_message);
            }
        }).always(function() {
            me.setLoading(false);
        });
    },
    
    _displayTimeline: function(records) {
        this.down('#display_box').add({
            xtype: 'tsalternativetimeline',
            height: 500,
            width: this.getWidth() - 20,
            records: records,
            pageSize: 7,
            chartStartDate: this.start,
            chartEndDate: this.end
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
    },
    
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        // Ext.apply(this, settings);
        this.launch();
    }
});
