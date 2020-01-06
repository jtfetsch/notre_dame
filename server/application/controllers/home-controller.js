// LIBRARIES -------------------------------------------------------------------

// MobileDetect - inspects web requests for a mobile user-agent
// http://hgoebl.github.io/mobile-detect.js/
var MobileDetect = require('mobile-detect');

// CONTROLLER METHODS ----------------------------------------------------------

var homeController = {
    
    // Inspects the incoming request for a phone user-agent and redirects to
    // the mobile route or returns the requested HTML page
    desktop: function(request, response) {
        var mobileDetect = new MobileDetect(request.headers['user-agent']);
        if(mobileDetect.phone() !== null) response.redirect('/mobile');
        else response.render('desktop/layout');
    },
    
    // Inspects the inoming request for a non-phone user-agent and redirects to
    // the desktop route, or returns the requested HTML page
    mobile: function (request, response) {
        var mobileDetect = new MobileDetect(request.headers['user-agent']);
        if(mobileDetect.phone() !== null) response.render('mobile/layout');
        else response.redirect('/');
    },
    
    socketsTest: function (request, response) {
        response.render('desktop/sockets-test');
    }
};

module.exports = homeController;