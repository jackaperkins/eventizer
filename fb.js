var db = require('./db');
var FB = require('fb');
var async = require('async');
var config = require('./config');

/*
FB SYNC
This copies whatever events are listed in the first 'page' of results from each FB page listed in the pages table
*/


FB.setAccessToken (config.fb_token);


  db.page.all(function(pages) {
    async.eachSeries(pages, function (page, callback) {

      console.log("\n======== Asking Zuck for " + page.fbid);
      FB.api(page.fbid+'/events', {fields: ['description', 'cover', 'start_time', 'end_time', 'place', 'name']}, function (res) {
        if(!res || res.error) {
         callback(!res ? 'error occurred' : res.error)
         return;
        }

        console.log("Found " + res.data.length + " events:");
        async.eachSeries(res.data, function (e, callback) {
            console.log(e.name);
            if(page.get('id') == null) {
              console.log(page);
            }
            e.page_id = page.get('id');
            db.event.upsert(e, callback);
        }, callback);
      });

    }, function (err) {
      // done!

      if(err) {
        console.log("ASYNC ERR");
        console.log(err);
        process.exit();
      } else {
        // clean old events
        db.event.clean(function () {
          process.exit();
        });
      }

    });
  });
