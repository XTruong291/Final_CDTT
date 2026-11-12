/**
 * Upload Service - Cloudinary (Unsigned Upload Preset)
 * 
 * Hướng dẫn cấu hình:
 * 1. Đăng nhập Cloudinary: https://cloudinary.com
 * 2. Vào Settings > Upload > Upload Presets > Add Upload Preset
 * 3. Signing Mode: "Unsigned"
 * 4. Folder: "avatars" (tuỳ chọn)
 * 5. Copy "Upload Preset Name" & "Cloud Name" vào file .env
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload ảnh lên Cloudinary
 * @param {File} file - File ảnh từ input
 * @param {function} onProgress - Callback theo dõi tiến trình upload (0-100)
 * @returns {Promise<string>} URL ảnh đã upload
 */
export const uploadImage = async (file, onProgress) => {
  // Validate file
  if (!file) throw new Error('Vui lòng chọn một tệp ảnh.');

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Định dạng không hỗ trợ. Chỉ chấp nhận JPG, PNG, WebP, GIF.');
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Chưa cấu hình Cloudinary. Vui lòng kiểm tra VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET trong file .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'espirit_avatars');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    // Theo dõi tiến trình upload
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Upload ảnh thất bại.'));
        } catch {
          reject(new Error('Upload ảnh thất bại. Vui lòng thử lại.'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Lỗi kết nối khi upload ảnh. Vui lòng kiểm tra mạng.'));
    };

    xhr.send(formData);
  });
};
