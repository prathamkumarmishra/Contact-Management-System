const cloudinary = require('cloudinary').v2;
const env = require('./env');

const isConfigured = 
  env.CLOUDINARY_CLOUD_NAME && 
  env.CLOUDINARY_API_KEY && 
  env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary SDK configured successfully');
} else {
  console.warn('⚠️ Cloudinary is not configured. File uploads will fall back to local disk storage.');
}

module.exports = {
  cloudinary,
  isConfigured
};
