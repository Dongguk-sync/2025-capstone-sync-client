// src/api/documentApi.js
import axios from './axios';

export const fetchDocuments = () => {
  return axios.get('/documents');
};

export const fetchDocumentById = (docId) => {
  return axios.get(`/documents/${docId}`);
};

export const fetchLatestHistoryIndex = (docId) => {
  return axios.get(`/documents/${docId}/latest-history`);
};
