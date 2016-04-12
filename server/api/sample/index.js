'use strict';

var express = require('express');
var controller = require('./sample.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search', controller.search);
router.get("/spFullName", controller.spFullName);
router.get("/spTreeMap", controller.spTreeMap);
router.get('/:id', controller.show);
router.get('spFullName/:spFullName', controller.showspFullName);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;