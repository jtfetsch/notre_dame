define(function(){

this["JST"] = this["JST"] || {};

this["JST"]["equipment/equipment-list-item"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="icon-container">\n    <span class="icon custom-equipment"></span>\n</div>\n\n<div class="info-container">\n    <span class="name">' +
((__t = ( name )) == null ? '' : __t) +
'</span>\n    \n    ';
 if(description === null) { ;
__p += '\n        <span class="description unavailable">No description listed</span>\n    ';
 } else { ;
__p += '\n        <span class="description">' +
((__t = ( description )) == null ? '' : __t) +
'</span>\n    ';
 } ;
__p += '\n    \n    <span class="usage-status">\n        ';
 if(running === true) { ;
__p += '\n            Currently in use\n        ';
 } else if(running) === false) { ;
__p += '\n            Not in use\n        ';
 } else { ;
__p += '\n            Usage data unavailable\n        ';
 } ;
__p += '\n    </span>\n</div>';

}
return __p
};

this["JST"]["equipment/equipment-list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="search-input-container">\n    <input type="search" placeholder="Find equipment">\n</div>\n<div class="equipment-list"></div>';

}
return __p
};

this["JST"]["users/users-list-item"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="icon-container">\n    <span class="icon ion-ios7-person"></span>\n</div>\n\n<div class="info-container">\n    <span class="name">' +
((__t = ( firstName )) == null ? '' : __t) +
' ' +
((__t = ( lastName )) == null ? '' : __t) +
'</span>\n    <span class="email">' +
((__t = ( netid )) == null ? '' : __t) +
'@nd.edu</span>\n    <span class="location-status">\n        ';
 if(isInRoom === true) { ;
__p += '\n            Currently in cleanroom\n        ';
 } else if(isInRoom === false) { ;
__p += '\n            Not in cleanroom\n        ';
 } else { ;
__p += '\n            Location data unavailable\n        ';
 } ;
__p += '\n    </span>\n</div>';

}
return __p
};

this["JST"]["users/users-list"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="search-input-container">\n    <input type="search" placeholder="Find users">\n</div>\n<div class="users-list"></div>';

}
return __p
};

  return this["JST"];

});
