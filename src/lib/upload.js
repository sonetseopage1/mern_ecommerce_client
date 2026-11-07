import toast from 'react-hot-toast';
import api, { errMsg } from '@/lib/api';

// Uploads image files to the API and returns their public URLs ([] on failure)
export async function uploadFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return [];
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  try {
    const { data } = await api.post('/uploads', fd);
    return data.urls;
  } catch (e) {
    toast.error(errMsg(e));
    return [];
  }
}
