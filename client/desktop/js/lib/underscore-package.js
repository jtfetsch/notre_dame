define([
    'underscore',
    'underscore.string'
], function (_, _str) {
    _.str = _str;
    
    _.str.fuzzyMatch = (function(){
        var cache = _.memoize(function(str){
            return new RegExp("^"+str.replace(/./g, function(x){
                return (/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/).test(x) ? "\\"+x+"?" : x+"?";
            })+"$");
        });
        
        return function(str, pattern){
            if (!pattern) return true;
            else return cache(str).test(pattern);
        };
    })();
    
    return _;
});