const express = require('express');
const _ = require('lodash');
const fs = require('fs');
const { Schema } = require('mongoose');
const Lamps = require('../models/Lamps');
const Folders = require('../models/Folders');
const GoogleController = require('../controller/GoogleController');
const Lamp = require('../models/Lamps');
const Files = require('../models/Files');
const { Drive } = require('../../config/google');

const router = express.Router();

async function uploadFileToGoogle({
  file, fileName, mimeType, parents = '1qAiej23fqT8t5Y11Dvrp8DQcpV6RGKOq',
}) {
  try {
    const response = await Drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [parents], // folder id [** only folder id **]
      },
      media: {
        mimeType,
        body: file,
      },
    });
    await Drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    const getFile = await Drive.files.get({
      fileId: response.data.id,
      fields: '*',
      quotaUser: 'test',

    });
    return {
      file: getFile.data, status: 200, message: 'success',
    };
  } catch (e) {
    console.error('uploadFile => ', e.message);
    return {
      ...e,
    };
  }
}
router.post('/api/upload/file-one', async (req, res) => {
  try {
    const { body } = req;
    if (!_.result(body, 'lamp_id', '')) {
      res.status(400).json({
        success: false,
        message: 'lamp_id is required',
        data: {
          version: '1.0.0',
        },
      });
      return;
    }
    const _id = _.result(body, 'lamp_id', '');
    const lamp = await Lamps.findOne({ _id }).populate('folder_id').populate({
      path: 'alley_id',
      populate: {
        path: 'folder_id',
      },
    });
    if (!lamp) {
      res.status(400).json({
        success: false,
        message: 'lamp_id is not found',
        data: {
          version: '1.0.0',
        },
      });
      return;
    }
    let node_id = '';
    if (_.result(lamp, 'folder_id.node_id')) {
      node_id = _.result(lamp, 'folder_id.node_id');
    } else {
      const folder = await GoogleController.createFolder(lamp.name, _.result(lamp, 'alley_id.folder_id.node_id'));
      await Lamp.findOneAndUpdate({ _id: lamp._id }, { $set: { folder_id: folder._id } });
      node_id = _.result(folder, 'node_id');
    }
    const findSequence = await Files.findOne({ lamp_id: lamp._id }).sort({ sequence: -1 });
    const lastSequence = +_.result(findSequence, 'sequence', 0);
    const mimeType = _.result(body, 'image.type', 'image/jpeg');
    const base64 = _.result(body, 'image.data_url', '');
    const name = `${_.result(lamp, 'name', 'untitled')} รูปที่ ${lastSequence + 1}`;
    const fileName = `public/documents/${name}.${mimeType.split('/')[1]}`;
    const base64Image = base64.split(';base64,')
      .pop();
    if (!fs.existsSync('public/documents')) {
      fs.mkdirSync('public/documents');
    }
    fs.writeFile(fileName, base64Image, { encoding: 'base64' }, (err) => {
    });
    //
    const _upload = await uploadFileToGoogle({
      file: fs.createReadStream(fileName),
      fileName: fileName.split('/')[2],
      mimeType,
      parents: node_id,
    });
    if (_.result(_upload, 'file.id')) {
      await Files.create({
        name,
        node_id: _.result(_upload, 'file.id'),
        lamp_id: _id,
        sequence: lastSequence + 1,
      });
    }
    fs.unlinkSync(fileName);
    res.json({
      success: true,
      message: 'loh-bangkok-light-monitor',
      data: {
        version: '1.0.0',
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: 'loh-bangkok-light-monitor',
      data: {
        version: '1.0.0',
      },
    });
  }
});
module.exports = router;
