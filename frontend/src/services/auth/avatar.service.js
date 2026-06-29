import api from '../api.js';

/**
 * Uploads an avatar image
 * @param {string} role - The user's role (customer, provider, admin)
 * @param {File} file - The image file to upload
 * @returns {Promise}
 */
export const uploadAvatar = (role, file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return api.post(`/auth/${role}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Deletes the avatar image
 * @param {string} role - The user's role (customer, provider, admin)
 * @returns {Promise}
 */
export const deleteAvatar = (role) => {
  return api.delete(`/auth/${role}/avatar`);
};
