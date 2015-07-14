'use strict';

var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var SampleSchema = new Schema({
  specieinfo: {
    family: String,
    genus: String,
    specie: String,
    authority: String,
    synonym: String
  },
  specie: {status: String},
  ethnoinfo: {
    commonname: String},
  usecategory: {
    traditional: String,
    who: String
  },
  formofuse: String,
  partused: String,
  passport: {
    biome: String,
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lon: Number
    },
  },
  reference : {
    paper: String,
    collector: String,
    origin: String
  }
  
});

SampleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Sample', SampleSchema);