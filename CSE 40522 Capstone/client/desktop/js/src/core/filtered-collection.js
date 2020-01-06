//Factory for creating a collection decorator
//original source: http://jsfiddle.net/derickbailey/7tvzF/

define([],
       function() {
  function filtered_collection(original) {

    var filtered = new original.constructor();

    // callbacks property for the filtered collection
    filtered._callbacks = {};

    // define the 'where' function for the filtered collection
    // such that the filtered objects come from the original collection
    filtered.where = function(criteria) {
      var items;

      // call 'where' on original collection if given criteria
      // otherwise just get the entire original collection
      if(criteria) {
        items = original.where(criteria);
      } else {
        items = original.models;
      }

      // store the criteria as a property of the filtered collection
      filtered._currentCriteria = criteria;

      // reset the filtered collection to only contain the previously
      // found items
      filtered.reset(items);

    };

    // listen for the original collection to be reset
    original.on('reset', function() {
      // re-fill the filtered collection from the updated original collection
      filtered.where(filtered._currentCriteria);
    });

    return filtered;
   }
   return filtered_collection;
 });
