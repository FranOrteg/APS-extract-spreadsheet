require('dotenv').config();

let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_URN, PORT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_URN) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
PORT = PORT || 8080;

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_URN,
    PORT
};
