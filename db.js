var Sequelize = require('sequelize');

var config = require('./config');

var url = 'mysql://' + config.db_user + ':' + config.db_pass + '@localhost:3306/' + config.db_name;
const sequelize = new Sequelize(url, {logging: false});

const Tag = sequelize.define('tag', {
  name: Sequelize.STRING,
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
});

const Page = sequelize.define('page', {
  title: Sequelize.STRING,
  fbid: {
    unique:true,
    type: Sequelize.STRING
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
  tag_id: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});



const Events = sequelize.define('event', {
  name: Sequelize.STRING,
  place_name: Sequelize.STRING,
  fbid: {
    unique:true,
    type: Sequelize.BIGINT.UNSIGNED
  },

  picture_url: Sequelize.STRING,

  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  description: Sequelize.TEXT
}, {
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

Page.belongsTo(Tag, {foreignKey: 'tag_id'});
Events.belongsTo(Page, {foreignKey: 'page_id'});



module.exports = {
  sync : function (){
    Tag.sync();

    Events.sync();
    Page.sync();

  },
  tag : {
    all : function (callback) {
      Tag.all().then(callback);
    },
    one : function (id, callback) {
      Tag.findAll({
        where: {
          id: id
        }
      }).then(function (data){
        if(data.length == 0) throw "oh no";
        callback(data[0]);
      });
    }
  },
  page : {
    all : function (callback) {
      Page.all({
        order:[['tag_id']],
        include:[Tag]
      }).then(callback);
    }
  },
  event : {
    clean : function (callback) {
      Events.destroy({
        where: {start_time: {
          // delete all more than 3 days old
          $lt:  new Date(new Date() - 3 * 24 * 60 * 60 * 1000)
        }}
      }).then(callback);
    },
    all : function (callback) {
      Events.all({
        include: {model:Page, include: [Tag]},
        order:[['start_time']],
        where: {start_time: {
          $gt: new Date(new Date() - 8 * 60 * 60 * 1000)
        }}
      }).then(callback);
    },
    tag : function (tag_id, callback) {
      Events.all({
        include: {model:Page, where: {tag_id: {$eq:tag_id}}, include: [Tag]},
        order:[['start_time']],
        where: {
          start_time: {
            $gt: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      }).then(callback);
    },
    upsert : function (e, callback) {
      // findorcreate so we only make it once, dont upsert incase we manually change rows after scrape
      Events.findOrCreate({
        where: {
          fbid: e.id
        },
        defaults:{
          page_id: e.page_id,
          name: e.name,
          description: e.description,
          fbid: e.id,
          picture_url: e.cover ? e.cover.source : '',
          start_time: e.start_time,
          end_time: e.end_time,
          place_name: e.place ? e.place.name : ''
        }
      }).then(function () {
        callback();
      });
    }
  }
};
/*
# super secret query to find pages with no new events
SELECT pages.title, tags.name AS "tag", pages.id, COUNT(events.id) AS "event_count" from pages
LEFT JOIN events on events.page_id = pages.id
AND (
  events.createdAt > DATE_ADD(NOW(), interval -30 day)

)
LEFT JOIN tags ON pages.tag_id = tags.id
GROUP BY pages.id
ORDER BY event_count ASC;


*/
