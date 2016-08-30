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
            fetch: ['ObjectID','Name','FormattedID',
                'PlannedStartDate','PlannedEndDate','ActualStartDate','ActualEndDate',
                'PercentDoneByStoryCount'],
            limit: 4,
            pageSize: 4
        };

        var release_config = { 
            model: 'Release',
            filters: [{property:'ReleaseStartDate', operator: '>=', value: start}],
            fetch: ['ObjectID','Name','FormattedID','ReleaseStartDate','ReleaseDate'],
            limit: 2,
            pageSize: 2
        };
        
        var iteration_config = { 
            model: 'Iteration',
            filters: [{property:'StartDate', operator: '>=', value: start}],
            fetch: ['ObjectID','Name','FormattedID','StartDate','EndDate'],
            limit: 2,
            pageSize: 2
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
            chartEndDate: this.end,
            getCategoryString: this._getCategoryString,
            getCategoryHeader: this._getCategoryHeader,
            
            eventsForPlannedItems: {
                click: function() {
                    alert(this._record._refObjectName);
                }
            },
            eventsForActualItems: {
                click: function() {
                    alert('Actual!');
                }
            },
            additionalPlotlines: [{
                color: '#0c0',
                width: 1,
                date: Rally.util.DateTime.add(new Date(),'day',-25),
                zIndex: 4
            
            }]
        });
    },
    
    _getCategoryHeader: function(){
        var html = "<table><tr>";
        
        html += Ext.String.format("<td class='ts-timeline-category-cell' style='width:75px'>{0}</td>",'One');
        html += Ext.String.format("<td class='ts-timeline-category-cell' style='width:100px'>{0}</td>",'Two');
        
        html += "</tr></table>";

        return html;
    },
    
    _getCategoryString: function(record) {
        var html = "<table><tr>";
        
        html += Ext.String.format("<td class='ts-timeline-category-cell' style='width:75px'>{0}</td>",record.get('Name'));
        html += Ext.String.format("<td class='ts-timeline-category-cell' style='width:100px'>{0}</td>",record.get('Name'));
        
        html += "</tr></table>";

        return html;
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
