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

// This file is based on the tutorial
// https://developer.autodesk.com/en/docs/viewer/v2/tutorials/basic-viewer/

let viewer;

function showModel(urn) {
  const options = {
    env: 'AutodeskProduction2',   // o 'AutodeskProduction', según el caso
    api: 'derivativeV2',         // fuerza a usar la ruta V2 (ACC/ADP)
    useADP: true,                // activa ADP
    getAccessToken: getAccessToken
  };

  Autodesk.Viewing.Initializer(options, function () {
    // Opcional: ver mensajes debug en consola
    Autodesk.Viewing.Private.logger.setLevel(0);

    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('viewer'));
    viewer.start();

    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}



function onDocumentLoadSuccess(doc) {
  const node = doc.getRoot().getDefaultGeometry();
  if (node) {
    console.log('Loading viewable', node.data);
    viewer.loadDocumentNode(doc, node);
  } else {
    console.warn('No viewable found');
  }
}

function onDocumentLoadFailure(err) {
  console.error('Could not load document: ' + err);
}
