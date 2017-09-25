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
 },
 new_class : function (date) {
   if(isNew(date)) return 'new';
 },
 new_tag : function (date) {
   if(isNew(date)) return '<span class="tag tag-new">new</span>';
 }
}


function isNew(date){
  var oneDay = 1 * 24 * 60 * 60 * 1000;
  var sixHours = 6 * 60 * 60 * 1000;

  var threshold = new Date(new Date() - oneDay);
  if(date > threshold) {
    return true;
  } else {
    return false;
  }
}
