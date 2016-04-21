'use strict';

var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    mongooseAggregatePaginate = require('mongoose-aggregate-paginate'),
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
    biome: Array,
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

SampleSchema
.virtual("spFullName")
.get(function() {
  return this.specieinfo.genus + "|" + this.specieinfo.specie + "|" + this.specieinfo.authority;
});

SampleSchema.plugin(mongoosePaginate);
SampleSchema.plugin(mongooseAggregatePaginate);
console.log(SampleSchema)

module.exports = mongoose.model('Sample', SampleSchema);