define([
    'backbone-package',
    'underscore-package',
    'src/core/requests',
    'src/core/data'
], function (Backbone, _, requests) {

    return Backbone.Marionette.ItemView.extend({
        template: 'users/users-profile',    
        
        onRender: function () {
            this._setBackgroundImage();
            this.ui.input.val(this.userInput);
            this.ui.hours.html(this.workerHours);
            this.ui.equipment.html(this.mostFreqEquip);
            this.ui.input.focus();
        },

        ui: {
            photo: '.photo',
            input: '#daysWorked',
            hours: '#hoursWorked',
            equipment: '#mostUsedEquipment',
            equipmentEventsList: '#equipmentEventsList',
            userEventsList: '#userEventsList'
        },                

        modelEvents: {
            'change UserEvents' : 'render',
            'change EquipmentEvents' : 'render'
        },

        events: {
            'keyup @ui.input' : 'updateStats',
            'submit form' : 'submit'
        },

        userInput: 0,

        workerHours: 0,

        mostFreqEquip: 'No Equipment Information Available',

        onModelImageUriChanged: function () {
            this._setBackgroundImage();
        },

        _setBackgroundImage: function () {
            this.ui.photo.css({
                'background-image': 'url(' + this.model.get('imageUri') + ')'
            });
        },

        onClose: function () {
            this._currentSearchVal = null;
        },

        submit: function() {
            //Here to prevent page from reloading
            //when enter is pressed
            return false;
        },

        updateStats: function () {
            var self = this;
            var userBadgeNumber = this.model.get('badge');
            var days = this.ui.input.val();
            var eventsUser = null;
            var eventsEquipment = null;
            this.userInput = days;
            var notNumber = isNaN(days);

            if (days !== "" && !notNumber)
            {
                self.ui.input.css("background-color", "white");
                var hoursWorked = 0;
                var mostUsedEquip = null;
                var userEventArray = [];
                $.getJSON("/api/v1/users/" + userBadgeNumber + "/hours?days=" + days, function (data) {
                    hoursWorked = data.hours.toFixed(2);
                    self.workerHours = hoursWorked;
                    self.ui.hours.html(hoursWorked);
                });
                $.getJSON("/api/v1/users/" + userBadgeNumber + "/most-used-equip?days=" + days, function (data) {
                    mostUsedEquip = data.mostUsedEquipment;
                    self.mostFreqEquip = mostUsedEquip;
                    self.ui.equipment.html(mostUsedEquip);
                });
                $.getJSON("/api/v1/users/" + userBadgeNumber + "/user-events?days=" + days, function (data) {
                    eventsUser = data.slice(0);
                    self.model.set("UserEvents", eventsUser);
                    self.ui.userEventsList.show();
                });   
                $.getJSON("/api/v1/users/" + userBadgeNumber + "/equipment-events?days=" + days, function (data) {
                    eventsEquipment = data.slice(0);
                    self.model.set("EquipmentEvents", eventsEquipment);
                    self.ui.equipmentEventsList.show();
                });                              
            }
            else
            {
                if(notNumber)
                {
                    self.ui.input.css("background-color", "red");
                }
                self.ui.hours.html(0);
                self.ui.equipment.html("No Equipment Information Available");
                self.ui.userEventsList.hide();
                self.ui.equipmentEventsList.hide();
            }            

        }

    });
});