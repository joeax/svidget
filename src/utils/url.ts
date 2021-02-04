/*****************************************
svidget.util.js

Contains misc util methods.

Last Updated: 03-Sep-2014

Dependencies:
(none)

******************************************/

namespace Svidget {
  export class Url {
    /**
     * Gets all the values from the query string and returns the result as an object.
     * Adapted from SO answer: http://stackoverflow.com/a/2880929/242407
     * @static
     * @memberof Svidget
     * @param {bool} duplicates - if true, group duplicates into an array (default == false)
     * @param {} lastOneWins - if true, then last duplicate encountered will win, else first one will win (default == false)
     */
    static queryString(
      duplicates: boolean,
      lastOneWins: boolean
    ): { [key: string]: string } {
      var urlParams = {};
      if (!window.location) return urlParams;
      var queryString =
        window.location.search == null || window.location.search.length > 0
          ? window.location.search
          : "";
      var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
          return decodeURIComponent(s.replace(pl, " "));
        },
        query = queryString.substring(1);

      while ((match = search.exec(query))) {
        // index 1 and 2 because those are the subgroups in parens (), index 0 is the whole string match
        var name = decode(match[1]),
          value = decode(match[2]);
        var array;
        if (duplicates) {
          if (urlParams[name] !== undefined) {
            if (Array.isArray(urlParams[name])) urlParams[name].push(value);
            else urlParams[name] = [urlParams[name], value];
          } else urlParams[name] = value;
        } else if (lastOneWins || urlParams[name] === undefined)
          urlParams[name] = value;
      }

      return urlParams;
    }
  }
}
