/// <reference path="../../../typings/jquery/jquery.d.ts"/>
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
  var dotFilter = dot.dot(filter);
  var sort = JSON.parse(req.query.sort || '{}');
  console.log("Sort: ", sort);

  console.log(dotFilter);
  Sample.paginate(dotFilter, { page: req.query.page, limit: req.query.limit, sort: sort }, function (err, samples, pageCount, itemCount) {
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

// Get list of all species names filtered 
exports.spName = function (req, res) {

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
    .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus", specie: "$specieinfo.specie" }, count: { "$sum": 1 }, species: { "$addToSet": "$_id" } })
    .sort({ _id: 1 });
  console.log("AGGREGATE1: ", aggregate);

  Sample.aggregate(aggregate._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    var data = {};
    data.spName = results;
    //Todo - retornar o número exato de docs

    console.log('Data : ', data);
    return res.json(200, data);
  });
};

// Get filtered species tree
exports.spTree = function (req, res) {

  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("Filtro SPTree: ",filter);
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
  };

  var tree = [];

  // aggregate family
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .group({ _id: { family: "$specieinfo.family" }, count: { "$sum": 1 } })
    .sort({ _id: 1 });

  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    results.forEach(function (item) {
      var id = item._id.family;
      var type = 'family';
      var parent = '0';
      var count = item.count;
      var samplesKey = {family:item._id.family};
              var row = { id: id, type: type, parent: parent, count: count, samplesKey:samplesKey };
      tree.push(row);
    });

    //aggregate genus  
    var aggregateG = Sample.aggregate();
    aggregateG
      .match(matchQ)
      .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus" }, count: { "$sum": 1 } })
      .sort({ _id: 1 });
    Sample.aggregate(aggregateG._pipeline, function (err, results) {
      if (err) { return handleError(res, err); }
      results.forEach(function (item) {
        var id = item._id.genus;
        var type = 'genus';
        var parent = item._id.family;
        var count = item.count;
        var samplesKey = { family: item._id.family, genus: item._id.genus};
        var row = { id: id, type: type, parent: parent, count: count, samplesKey: samplesKey };
        tree.push(row);
      });

      //aggregate specie  
      var aggregateS = Sample.aggregate();
      aggregateS
        .match(matchQ)
        .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus", specie: "$specieinfo.specie" }, count: { "$sum": 1 } })
        .sort({ _id: 1 });
      Sample.aggregate(aggregateS._pipeline, function (err, results) {
        if (err) { return handleError(res, err); }
        results.forEach(function (item) {
          if (item._id.genus !== null) {
            var id = item._id.specie;
            var type = 'specie';
            var parent = item._id.genus;
            var count = item.count;
            var samplesKey = { family: item._id.family, genus: item._id.genus, specie: item._id.specie };
            var row = { id: id, type: type, parent: parent, count: count, samplesKey: samplesKey };
            tree.push(row);
          }
        });
        return res.status(200).json(tree);
      });
    });
  });
};

// Get a google chart formated treemap for filtered samples hierarchies by family/genus/specie+authority 
exports.spTreeMap = function (req, res) {

  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("filtro treemap: ", filter);
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
  };

  var treemap = {
    cols: [{ id: 'id', label: 'ID', type: 'string' },
      { id: 'parent', label: 'Parent', type: 'string' },
      { id: 'size', label: 'Size', type: 'number' }
    ],
    rows: [{ c: [{ v: '#' }, { v: '' }] }]
    //rows: []
  };

  // aggregate family
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .group({ _id: { family: "$specieinfo.family" }, count: { "$sum": 1 } });
  console.log ("MatchQ :", matchQ);
  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    console.log("ResultsF :", results);
    results.forEach(function (item) {
      var id = 'Family|' + item._id.family;
      var parent = '#';
      var row = { c: [{ v: id, f: item._id.family }, { v: parent }, { v: item.count }] };
      treemap.rows.push(row);
    });

    //aggregate genus  
    var aggregateG = Sample.aggregate();
    aggregateG
      .match(matchQ)
      .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus" }, count: { "$sum": 1 } });
    Sample.aggregate(aggregateG._pipeline, function (err, results) {
      if (err) { return handleError(res, err); }
      results.forEach(function (item) {
        var id = 'Genus|' + item._id.family + ":" + item._id.genus;
        var parent = 'Family|' + item._id.family;
        var row = { c: [{ v: id, f: item._id.genus }, { v: parent }, { v: item.count }] };
        treemap.rows.push(row);
      });

      //aggregate specie  
      var aggregateS = Sample.aggregate();
      aggregateS
        .match(matchQ)
        .group({ _id: { family: "$specieinfo.family", genus: "$specieinfo.genus", specie: "$specieinfo.specie", author: "$specieinfo.authority" }, count: { "$sum": 1 } });
      Sample.aggregate(aggregateS._pipeline, function (err, results) {
        if (err) { return handleError(res, err); }
        results.forEach(function (item) {
          if (item._id.genus !== null) {
            var id = 'Specie|' + item._id.family + ":" + item._id.genus + ":" + item._id.specie + ":" + item._id.author;
            var parent = 'Genus|' + item._id.family + ":" + item._id.genus;
            var row = { c: [{ v: id, f: item._id.genus + " " + item._id.specie + " " + item._id.author }, { v: parent }, { v: item.count }] };
            treemap.rows.push(row);
          }
        });
        return res.status(200).json(treemap);
      });
    });
  });
};

// Get a google chart formated piechart dataTable for filtered samples by WHO distribuition 
exports.spWho = function (req, res) {
  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("W : ", filter);
  var matchQ = {};
  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$eq"] = filter[key];
        //regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  };
  var data = {
    cols: [{ id: 'id', label: 'ID', type: 'string' },
      { id: 'size', label: 'Size', type: 'number' }
    ],
    //rows: [{ c: [{ v: '#' }, { v: '' }] }]
    rows: []
  };

  // aggregate WHO
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .group({ _id: { who: "$usecategory.who" }, count: { "$sum": 1 } })
    .sort({"_id.who" : 1});

  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    results.forEach(function (item) {
      var row = { c: [{ v: item._id.who }, { v: item.count }] };
      data.rows.push(row);
    });
    return res.status(200).json(data);
  });
}

// Get a google chart formated piechart dataTable for filtered samples by WHO distribuition 
exports.spBiome = function (req, res) {
  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("B : ", filter);
  var matchQ = {};
  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$eq"] = filter[key];
        //regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  };
  console.log("b : ", matchQ);
  var data = {
    cols: [{ id: 'id', label: 'ID', type: 'string' },
      { id: 'size', label: 'Size', type: 'number' }
    ],
    //rows: [{ c: [{ v: '#' }, { v: '' }] }]
    rows: []
  };

  // aggregate Biome
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .unwind("$passport.biome")
    .group({ _id: { biome: "$passport.biome" }, count: { "$sum": 1 } })
    .sort({"_id.biome" : 1});

  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    results.forEach(function (item) {
      var row = { c: [{ v: item._id.biome }, { v: item.count }] };
      data.rows.push(row);
    });
    return res.status(200).json(data);
  });
}
// Get a google chart formated piechart dataTable for filtered samples by partused distribuition 
exports.spPartUsed = function (req, res) {
  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("B : ", filter);
  var matchQ = {};
  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$eq"] = filter[key];
        //regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  };
  console.log("b : ", matchQ);
  var data = {
    cols: [{ id: 'id', label: 'ID', type: 'string' },
      { id: 'size', label: 'Size', type: 'number' }
    ],
    //rows: [{ c: [{ v: '#' }, { v: '' }] }]
    rows: []
  };

  // aggregate Biome
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .unwind("$partused")
    .group({ _id: { partused: "$partused" }, count: { "$sum": 1 } })
    .sort({"_id.partused" : 1});

  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    results.forEach(function (item) {
      var row = { c: [{ v: item._id.partused }, { v: item.count }] };
      data.rows.push(row);
    });
    return res.status(200).json(data);
  });
}
// Get a google chart formated piechart dataTable for filtered samples by formofuse distribuition 
exports.spFormofUse = function (req, res) {
  var filter = JSON.parse(req.query.filter || '{}');
  filter = dot.dot(filter);
  console.log("B : ", filter);
  var matchQ = {};
  for (var key in filter) {
    var regex = {};
    if (filter.hasOwnProperty(key)) {
      if (filter[key]) {
        regex["$eq"] = filter[key];
        //regex["$regex"] = new RegExp(filter[key], 'i');
        //console.log( key, regex);      
        matchQ[key] = regex;
      }
    }
  };
  console.log("b : ", matchQ);
  var data = {
    cols: [{ id: 'id', label: 'ID', type: 'string' },
      { id: 'size', label: 'Size', type: 'number' }
    ],
    //rows: [{ c: [{ v: '#' }, { v: '' }] }]
    rows: []
  };

  // aggregate Biome
  var aggregateF = Sample.aggregate();
  aggregateF
    .match(matchQ)
    .unwind("$formofuse")
    .group({ _id: { formofuse: "$formofuse" }, count: { "$sum": 1 } })
    .sort({"_id.formofuse" : 1});

  Sample.aggregate(aggregateF._pipeline, function (err, results) {
    if (err) { return handleError(res, err); }
    results.forEach(function (item) {
      var row = { c: [{ v: item._id.formofuse }, { v: item.count }] };
      data.rows.push(row);
    });
    return res.status(200).json(data);
  });
}

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
