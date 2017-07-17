describe("Example test set", function() {
    it('should render the app', function() {
        var app = Rally.test.Harness.launchApp("harness_ts_picker_field_value");
        expect(app.getEl()).toBeDefined();
    });

});
