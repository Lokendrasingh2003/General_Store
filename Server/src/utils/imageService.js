/**
 * Image Service
 * Handles image upload, deletion, and URL generation
 */

const fs = require('fs');
const path = require('path');
let AWS = null;
let cloudinary = null;

const getAwsSdk = () => {
  if (AWS) return AWS;
  try {
    // eslint-disable-next-line global-require
    AWS = require('aws-sdk');
    return AWS;
  } catch (error) {
    throw new Error('aws-sdk is not installed. Install it or switch STORAGE_TYPE to local.');
  }
};

const getCloudinary = () => {
  if (cloudinary) return cloudinary;
  try {
    // eslint-disable-next-line global-require
    cloudinary = require('cloudinary').v2;
    return cloudinary;
  } catch (error) {
    throw new Error('cloudinary is not installed. Install it or switch STORAGE_TYPE to local.');
  }
};

/**
 * Initialize Cloud Storage Based on Environment
 */
const initializeCloudStorage = () => {
  const storageType = process.env.STORAGE_TYPE;

  if (storageType === 's3') {
    const AwsSdk = getAwsSdk();
    AwsSdk.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  } else if (storageType === 'cloudinary') {
    const CloudinarySdk = getCloudinary();
    CloudinarySdk.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
};

initializeCloudStorage();

/**
 * Upload to Local Storage
 */
const uploadLocalImage = async (file, folder = 'products') => {
  if (!file) {
    throw new Error('No file provided');
  }

  // File is already saved by multer
  const filename = file.filename;
  const relativePath = `uploads/${folder}/${filename}`;
  // Use /uploads path to match the static file serving in app.js
  const publicUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/uploads/${folder}/${filename}`;

  return {
    filename,
    path: relativePath,
    url: publicUrl,
    size: file.size,
    mimetype: file.mimetype
  };
};

/**
 * Upload to AWS S3
 */
const uploadToS3 = async (file, folder = 'products') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const AwsSdk = getAwsSdk();
  const s3 = new AwsSdk.S3();
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const filename = `${folder}/${Date.now()}-${random}${path.extname(file.originalname)}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
    CacheControl: 'max-age=31536000' // 1 year cache
  };

  try {
    const result = await s3.upload(params).promise();

    return {
      filename: filename,
      path: result.Key,
      url: result.Location,
      size: file.size,
      mimetype: file.mimetype,
      etag: result.ETag
    };
  } catch (error) {
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Upload to Cloudinary
 */
const uploadToCloudinary = async (file, folder = 'products') => {
  if (!file) {
    throw new Error('No file provided');
  }

  return new Promise((resolve, reject) => {
    const CloudinarySdk = getCloudinary();
    const uploadStream = CloudinarySdk.uploader.upload_stream(
      {
        folder: `general-store/${folder}`,
        resource_type: 'auto',
        format: 'jpg', // Convert to JPG for optimization
        quality: 'auto:best',
        secure: true
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        resolve({
          filename: result.public_id,
          path: result.secure_url,
          url: result.secure_url,
          size: file.size,
          mimetype: file.mimetype,
          cloudinaryId: result.public_id,
          format: result.format
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Main Upload Function
 */
const uploadImage = async (file, folder = 'products') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const storageType = process.env.STORAGE_TYPE || 'local';

  switch (storageType) {
    case 's3':
      return await uploadToS3(file, folder);
    case 'cloudinary':
      return await uploadToCloudinary(file, folder);
    case 'local':
    default:
      return await uploadLocalImage(file, folder);
  }
};

/**
 * Delete Image from Storage
 */
const deleteImage = async (imageUrl, cloudinaryId = null) => {
  const storageType = process.env.STORAGE_TYPE || 'local';

  try {
    switch (storageType) {
      case 's3': {
        const AwsSdk = getAwsSdk();
        const s3 = new AwsSdk.S3();
        const key = imageUrl.split(process.env.AWS_S3_BUCKET + '/')[1];
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key
        }).promise();
        return { success: true, message: 'Image deleted from S3' };
      }

      case 'cloudinary': {
        if (!cloudinaryId) {
          throw new Error('Cloudinary ID required for deletion');
        }
        const CloudinarySdk = getCloudinary();
        await CloudinarySdk.uploader.destroy(cloudinaryId);
        return { success: true, message: 'Image deleted from Cloudinary' };
      }

      case 'local': {
        // Extract filename from URL
        const filename = imageUrl.split('/').pop();
        const folder = imageUrl.includes('products') ? 'products' 
                      : imageUrl.includes('profiles') ? 'profiles'
                      : 'banners';
        const filePath = path.join(__dirname, `../../uploads/${folder}/${filename}`);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return { success: true, message: 'Image deleted from local storage' };
        } else {
          return { success: false, message: 'File not found' };
        }
      }

      default:
        throw new Error('Unknown storage type');
    }
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Batch Upload Images
 */
const uploadBatchImages = async (files, folder = 'products') => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const uploadPromises = files.map(file => uploadImage(file, folder));
  const results = await Promise.all(uploadPromises);

  return {
    count: results.length,
    images: results
  };
};

/**
 * Delete Batch Images
 */
const deleteBatchImages = async (imagesToDelete) => {
  const deletePromises = imagesToDelete.map(image => 
    deleteImage(image.url, image.cloudinaryId)
  );

  const results = await Promise.allSettled(deletePromises);

  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  return {
    successful: successful.length,
    failed: failed.length,
    details: failed.map(f => f.reason?.message || 'Unknown error')
  };
};

/**
 * Validate Image Dimensions (Optional)
 */
const validateImageDimensions = async (imagePath, minWidth = 0, minHeight = 0) => {
  try {
    const imageSize = require('image-size');
    const dimensions = imageSize(imagePath);

    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      throw new Error(
        `Image dimensions ${dimensions.width}x${dimensions.height} are below minimum ${minWidth}x${minHeight}`
      );
    }

    return {
      valid: true,
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error) {
    throw new Error(`Dimension validation failed: ${error.message}`);
  }
};

/**
 * Generate Image Variants (Optional)
 */
const generateImageVariants = async (imageUrl, cloudinaryId = null) => {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'cloudinary' && cloudinaryId) {
    // Use Cloudinary's built-in transformation
    const baseUrl = imageUrl.replace('/upload/', '/upload/');
    
    return {
      original: imageUrl,
      thumbnail: imageUrl.replace('/upload/', '/upload/c_fill,h_200,w_200/'),
      small: imageUrl.replace('/upload/', '/upload/c_fill,h_400,w_400/'),
      medium: imageUrl.replace('/upload/', '/upload/c_fill,h_800,w_800/'),
      large: imageUrl.replace('/upload/', '/upload/c_fill,h_1200,w_1200/')
    };
  }

  // For local or S3, return the same URL for all variants
  return {
    original: imageUrl,
    thumbnail: imageUrl,
    small: imageUrl,
    medium: imageUrl,
    large: imageUrl
  };
};

module.exports = {
  uploadImage,
  uploadBatchImages,
  deleteImage,
  deleteBatchImages,
  validateImageDimensions,
  generateImageVariants,
  uploadLocalImage,
  uploadToS3,
  uploadToCloudinary,
  initializeCloudStorage
};
