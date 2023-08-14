const express = require('express');
const Projects = require('../models/Projects');
const Areas = require('../models/Areas');
const Alleys = require('../models/Alleys');
const Zones = require('../models/Zones');
const Lamps = require('../models/Lamps');
const Files = require('../models/Files');

const router = express.Router();
router.get('/api/list/projects', async (req, res) => {
  try {
    const data = await Projects.find({}).sort({ name: 1 });
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: [],
    });
  }
});
router.get('/api/list/areas/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const main = await Projects.findOne({ _id: project_id });
    const data = await Areas.find({ project_id }).sort({ name: 1 });
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data,
      main,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: [],
    });
  }
});
router.get('/api/list/zone/:area_id', async (req, res) => {
  try {
    const { area_id } = req.params;
    const main = await Areas.findOne({ _id: area_id });
    const data = await Zones.find({ area_id }).sort({ name: 1 });
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data,
      main,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: [],
    });
  }
});
router.get('/api/list/alley/:zone_id', async (req, res) => {
  try {
    const { zone_id } = req.params;
    const main = await Zones.findOne({ _id: zone_id });
    const data = await Alleys.find({ zone_id }).sort({ name: 1 });
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data,
      main,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: [],
    });
  }
});
router.get('/api/list/lamp/:alley_id', async (req, res) => {
  try {
    const { alley_id } = req.params;
    const main = await Alleys.findOne({ _id: alley_id });
    const data = await Lamps.find({ alley_id }).sort({ name: 1 });
    const files = await Files.find({ alley_id }).sort({ sequence: 1 });
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data,
      main,
      files,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: [],
    });
  }
});

module.exports = router;
