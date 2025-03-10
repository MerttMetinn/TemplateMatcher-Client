import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL
});

export interface ParameterSearchData {
  text_count: number;
  title_count: number;
  list_count: number;
  table_count: number;
  figure_count: number;
}

export interface AdvancedSearchData {
  elements: Array<{
    type: 'text' | 'title' | 'list' | 'table' | 'figure';
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
}

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/upload', formData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error uploading file:', error);
      throw error;
    });
};


export const searchWithAdvancedParameters = (params: AdvancedSearchData) => {
  return apiClient.post('/canvas', params)
    .then(response => response.data)
    .catch(error => {
      console.error('Error searching with advanced parameters:', error);
      throw error;
    });
}; 