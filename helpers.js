var moment = require('moment');

module.exports =  {
  substr: function (length, context, options) {
    if(context == null) return '';
   if ( context.length > length ) {
    return context.substring(0, length) + "...";
   } else {
    return context;
  }
 },
 split : function (text) {
   return text.split(',').join("<br>");
 },
 month_day : function (context) {
   // sep 26, tuesday, 7pm
   return moment(context).format("dddd, MMM D");
 },
 day_time : function (context) {
   // sep 26, tuesday, 7pm
   return moment(context).format("h a");
 }
}
