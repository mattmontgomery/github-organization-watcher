var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var redis = require('redis'),
    client = redis.createClient();
var _ = require('lodash');
var app = express();
var request = require('request');
var Promise = require('bluebird');

var key = 'gow.orgs',
    urlBase = 'https://api.github.com/orgs/',
    urlSuffix = '/repos?per_page=500'
    reposKey = 'gow.orgs.repos',
    headers = {
        'User-Agent': 'github-organization-watcher'
    };

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

router.get('/', function(req, res) {
  client.exists(reposKey, function(err, ext) {
    if(!ext && !err) {
        client.expire(reposKey,600);
    }
  });
  organizations = client.smembers(key, function(err, orgs) {
      if(orgs === 0) {
          return false;
      }
      var repos = {},
        promises = [];
      _.each(orgs, function(org) {
          var px = new Promise(function(resolve,reject) {
              client.hget(reposKey,org, function(err, data) {
                  if(!data) {
                    var url = urlBase + org + urlSuffix;
                    request.get({url: url, headers: headers}, function(error, resp, data) {
                      if(error) {
                        reject();
                      }
                      repos[org] = JSON.parse(data);
                      repos[org] = _(repos[org]).sortBy(['updated_at','created_at']).reverse().value();
                      client.hset(reposKey,org,data);
                      resolve(repos[org],org);
                    });
                  } else {
                    repos[org] = JSON.parse(data);
                    repos[org] = _(repos[org]).sortBy(['updated_at','created_at']).reverse().value();
                    resolve(repos[org],org);
                  }
              });
          });
          promises.push(px);
      });
      Promise.all(promises).then(function(){
          var orglist = _(orgs).sort().value();
          repos = _.sortBy(repos, function(k,idx) { return idx; });
          res.render('index', { title: 'Watcher', orglist: orglist, repos: repos });
      })
  });
});
router.put('/', function(req,res) {
    var response = req.body;
    if(response.orgs && _.isArray(response.orgs)) {
        client.sadd(key, response.orgs);
    }
    res.json({success: true});
})
router.delete('/:org', function(req, res) {
    var org = req.param('org');
    client.srem(key,org, function() {
        res.json({success: true});
    })
});
module.exports = router;
