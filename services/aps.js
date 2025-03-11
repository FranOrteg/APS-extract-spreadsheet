const { SdkManagerBuilder } = require('@aps_sdk/autodesk-sdkmanager');
const { AuthenticationClient, Scopes } = require('@aps_sdk/authentication');
const { ModelDerivativeClient, View, Type } = require('@aps_sdk/model-derivative');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require('../config.js');

const sdk = SdkManagerBuilder.create().build();
const authenticationClient = new AuthenticationClient(sdk);
const modelDerivativeClient = new ModelDerivativeClient(sdk);

const service = module.exports = {};

/**
 * Obtiene un token 2-legged interno (alcances amplios).
 * Ajusta scopes según tus necesidades
 */
service.getInternalToken = async () => {
  const credentials = await authenticationClient.getTwoLeggedToken(
    APS_CLIENT_ID, 
    APS_CLIENT_SECRET, 
    [
      Scopes.DataRead,
      Scopes.DataCreate,
      Scopes.DataWrite,
      Scopes.BucketCreate,
      Scopes.BucketRead,
      Scopes.BucketDelete,
      Scopes.ViewablesRead
    ]
  );
  return credentials;
};

/**
 * Obtiene un token 2-legged de solo lectura (para el Viewer).
 */
service.getPublicToken = async () => {
  const credentials = await authenticationClient.getTwoLeggedToken(
    APS_CLIENT_ID, 
    APS_CLIENT_SECRET,
    [
      Scopes.DataRead,
      Scopes.ViewablesRead
    ]
  );
  return credentials;
};

/**
 * Lanza la conversión de un archivo a SVF (o SVF2),
 * SI ES NECESARIO. 
 * Si tu archivo en ACC ya está traducido, tal vez ni uses este método.
 */
service.translateObject = async (urn, rootFilename) => {
  const { access_token } = await service.getInternalToken();
  const job = await modelDerivativeClient.startJob(access_token, {
    input: {
      urn,
      compressedUrn: !!rootFilename,
      rootFilename
    },
    output: {
      formats: [{
        views: [View._2d, View._3d],
        type: Type.Svf // o 'svf2', según prefieras
      }]
    }
  });
  console.log("job result", job.result);
  return job.result;
};

/**
 * Obtiene el manifest de un URN (para ver si ya está traducido).
 */
service.getManifest = async (urn) => {
  const { access_token } = await service.getInternalToken();
  try {
    const manifest = await modelDerivativeClient.getManifest(access_token, urn);
    return manifest;
  } catch (err) {
    if (err.axiosError?.response?.status === 404) {
      return null;
    } else {
      throw err;
    }
  }
};

/**
 * Convierte un ID a base64 (por si lo necesitas).
 */
service.urnify = (id) => Buffer.from(id).toString('base64').replace(/=/g, '');
