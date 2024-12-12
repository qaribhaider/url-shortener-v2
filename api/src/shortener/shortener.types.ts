export const URL_PROCESSING_QUEUE = 'url-processing';

export interface UrlProcessingJob {
  shortCode: string;
  originalUrl: string;
  timestamp: string;
}
