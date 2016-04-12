/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /samples              ->  index
 * POST    /samples              ->  create
 * GET     /samples/:id          ->  show
 * PUT     /samples/:id          ->  update
 * DELETE  /samples/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Sample = require('./sample.model');
var dot = require('dot-object');

// Get list of samples
exports.index = function (req, res) {
  Sample.find(function (err, samples) {
    if (err) { return handleError(res, err); }
    return res.json(200, samples);
  });
};

// Get list of samples filtered and paginated
exports.search = function (req, res) {
  /*  var conditions = {};
    for (var key in req.body.filterByFields) {
      if (req.body.filterByFields.hasOwnProperty(key)) {
        conditions[key] = req.body.filterByFields[key];
        console.log(conditions);
      } 
    }
   */
  var filter = JSON.parse(req.query.filter || '{}');
  console.log(filter);
  Sample.paginate(filter, { page: req.query.page, limit: req.query.limit, sortBy: req.query.sort }, function (err, samples, pageCount, itemCount) {
    if (err) { return handleError(res, err); }
    var data = {};
    data.samples = samples;
    //Todo - retornar o número exato de docs
    data.total = pageCount * req.query.limit;
    console.log('Data : ', data);
    return res.json(200, data);
  });
};

// Get list of all species full names filtered and paginated
exports.spFullName = function (req, res) {
  /*  var conditions = {};
    for (var key in req.body.filterByFields) {
      if (req.body.filterByFields.hasOwnProperty(key)) {
        conditions[key] = req.body.filterByFields[key];
        console.log(conditions);
      } 
    }
   */
  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log(filter);
  var matchQ = {};

  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  }

  console.log('MatchQ : ', matchQ);
  var aggregate = Sample.aggregate();
  aggregate
  //.match({"passport.biome": { $regex: /Caatinga/i}, "usecategory.who": { $regex: /DBI/i}})
    .match(matchQ)
    .group({ _id: { genus: "$specieinfo.genus", specie: "$specieinfo.specie", author: "$specieinfo.authority" }, count: { "$sum": 1 }, species: { "$addToSet": "$_id" } })
    .sort({ _id: 1 });
  console.log("AGGREGATE1: ", aggregate);
  var options = { page: req.query.page, limit: req.query.limit, sortBy: req.query.sort };

  Sample.aggregatePaginate(aggregate, options, function (err, results, pageCount, itemCount) {
    if (err) { return handleError(res, err); }
    var data = {};
    data.samples = results;
    //Todo - retornar o número exato de docs
    data.total = pageCount * req.query.limit;
    console.log('Data : ', data);
    return res.json(200, data);
  });
};

// Get a google chart formated treemap for filtered samples hierarchies by family/genus/specie+authority 
exports.spTreeMap = function (req, res) {

  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log(filter);
  var matchQ = {};

  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  }

  console.log('MatchQ : ', matchQ);
  var aggregate = Sample.aggregate(); 
  
  aggregate
    //.match({"passport.biome": { $regex: /Caatinga/i}, "usecategory.who": { $regex: /DBI/i}})
    .match(matchQ)
    .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus", specie: "$specieinfo.specie", author: "$specieinfo.authority" }, count: { "$sum": 1 } });
    //.sort({ _id: 1 });
  console.log('AGGREGATE: ', aggregate._pipeline);
  
  
  Sample.aggregate(aggregate._pipeline, function (err, results ) {
    if (err) { return handleError(res, err); }
    var treemap = {cols: [{id: 'id', label: 'ID', type: 'string'},
         {id: 'parent', label: 'Parent', type: 'string'},
         {id: 'size', label: 'Size', type: 'number'}
         ],
         rows: [{ c: [{ v: 'familyfake' }, { v: '#' }, { v: 0 }] }]
    };
    console.log(results);
    console.log(treemap);
    results.forEach( function (item) {
      // family
      console.log('item : ', item);
      console.log(item._id.family);
      console.log(treemap.rows);
      //if (treemap.rows.lenght > 0) {
        var findFamily = $.grep(treemap.rows, function (e) { return e.c[0].v === item._id.family });
        console.log('ff :', findFamily);
        if (findFamily.length == 0) {
          var row = { c: [{ v: item._id.family }, { v: '#' }, { v: 0 }] };
          treemap.rows.push(row);
        } else {
          console.log(findFamily[0]);
        }
      //}      
    });
    
    data.samples = results;
    //Todo - retornar o número exato de docs
    //data.total = pageCount * req.query.limit;
    console.log('Data : ', data);
    return res.json(200, data);
  });
};

// Get a single sample
exports.show = function (req, res) {
  Sample.findById(req.params.id, function (err, sample) {
    if (err) { return handleError(res, err); }
    if (!sample) { return res.send(404); }
    return res.json(sample);
  });
};

// Get a single sample by spFullName (genus|specie|authority)
exports.showspFullName = function (req, res) {
  Sample.find({ spFullName: req.params.spFullName }, function (err, sample) {
    if (err) { return handleError(res, err); }
    if (!sample) { return res.send(404); }
    return res.json(sample);
  });
};

// Creates a new sample in the DB.
exports.create = function (req, res) {
  Sample.create(req.body, function (err, sample) {
    if (err) { return handleError(res, err); }
    return res.json(201, sample);
  });
};

// Updates an existing sample in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Sample.findById(req.params.id, function (err, sample) {
    if (err) { return handleError(res, err); }
    if (!sample) { return res.send(404); }
    var updated = _.merge(sample, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, sample);
    });
  });
};

// Deletes a sample from the DB.
exports.destroy = function (req, res) {
  Sample.findById(req.params.id, function (err, sample) {
    if (err) { return handleError(res, err); }
    if (!sample) { return res.send(404); }
    sample.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}