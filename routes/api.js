/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by APS Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

String.prototype.toBase64 = function () {
  return Buffer.from(this).toString('base64');
};

const path = require('path');
const fs = require('fs');
const express = require('express');
const { getPublicToken, listObjects } = require('../services/aps.js');
let router = express.Router();

router.get('/api/auth/token', async function (req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch (err) {
        next(err);
    }
});

router.get('/models', async function (req, res) {
  res.json([
    {
      id: "my-revit-model",
      label: "My Revit Model",
      urn: process.env.APS_URN
    }
  ]);
});

router.get('/translate', async (req, res) => {
  const { translateObject, getInternalToken } = require('../services/aps.js');
  const urn = process.env.APS_URN; // tu URN actual
  try {
      const job = await translateObject(urn);
      res.json(job);
  } catch (err) {
      console.error(err);
      res.status(500).json(err);
  }
});




module.exports = router;
