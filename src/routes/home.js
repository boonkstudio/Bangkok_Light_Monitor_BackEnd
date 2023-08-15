const express = require('express');
const _ = require('lodash');
const GoogleSheetController = require('../controller/GoogleSheetController');
const SyncController = require('../controller/SyncController');
const Projects = require('../models/Projects');
const Area = require('../models/Areas');
const Zone = require('../models/Zones');
const Alley = require('../models/Alleys');
const Lamp = require('../models/Lamps');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'loh-bangkok-light-monitor',
    data: {
      version: '1.0.0',
    },
  });
});

router.get('/api/sync/all', async (req, res) => {
  const connect = new GoogleSheetController('1AnffHIOEhm2wALALux0YeOu7Hc12rrX8E9GEEmvXK1M');
  connect.setRange('โครงการ!A2:B');
  const project = await connect.get();
  connect.setRange('เขต!A2:B');
  const areas = await connect.get();
  connect.setRange('พื้นที่!A2:B');
  const zones = await connect.get();
  connect.setRange('ซอย!A2:c');
  const alleys = await connect.get();
  const length = project.length + areas.length + zones.length + alleys.length;
  let count = 0;
  const [projectData] = await Promise.all([Promise.all(project.map(async (item) => await Projects.findOneAndUpdate({ name: item[0] }, { $set: { name: item[0] } }, {
    new: true,
    upsert: true,
  })))]);
  for (const item of projectData) {
    if (item) {
      await SyncController.project(item);
      count++;
      console.debug(`process => ${(+(count / length) * 100)}%`);
    }
  }

  const areaData = await Promise.all(areas.map(async (item) => {
    const _project = await Projects.findOneAndUpdate({ name: item[0] }, { $set: { name: item[0] } }, { new: true, upsert: true });
    if (_project) {
      return Area.findOneAndUpdate({ name: item[1], project_id: _project._id }, {
        $set: {
          name: item[1],
          project_id: _project._id,
        },
      }, { new: true, upsert: true });
    }
  }));
  for (const item of areaData) {
    if (item) {
      await SyncController.area(item);
      count++;
      console.debug(`process => ${(+(count / length) * 100)}%`);
    }
  }

  const zoneData = await Promise.all(zones.map(async (item) => {
    const _area = await Area.findOne({ name: item[0] });
    if (_area) {
      return Zone.findOneAndUpdate({ name: item[1], area_id: _area._id }, {
        $set: {
          name: item[1],
          area_id: _area._id,
        },
      }, { new: true, upsert: true });
    }
  }));
  for (const item of zoneData) {
    if (item) {
      await SyncController.zone(item);
      count++;
      console.debug(`process => ${(+(count / length) * 100)}%`);
    }
  }

  const alleyData = await Promise.all(alleys.map(async (item) => {
    const _zone = await Zone.findOne({ name: item[0] });
    if (_zone) {
      return Alley.findOneAndUpdate({ name: item[1], zone_id: _zone._id }, { $set: { name: item[1], zone_id: _zone._id } }, { new: true, upsert: true });
    }
  }));
  for (const item of alleyData) {
    if (item) {
      await SyncController.alley(item);
      count++;
      console.debug(`process => ${(+(count / length) * 100)}%`);
    }
  }
  for (const item of alleyData) {
    const find = _.find(alleys, (o) => o[1] === item.name);
    if (find) {
      await SyncController.lamp(item, find);
    }
  }
  res.json({ success: true });
});

module.exports = router;
