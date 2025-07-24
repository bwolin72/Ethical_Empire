// src/hooks/useMediaFetcher.js
import { useEffect, useState, useCallback } from 'react';
import axiosCommon from '../api/axiosCommon';

/**
 * Hook to fetch media (or banners) with pagination, filtering, and search.
 *
 * @param {Object} options
 * @param {'media'|'banner'} options.type - Type of media
 * @param {string|null} options.endpoint - Optional endpoint
 * @param {boolean|null} options.isActive - Filter by active status
 * @param {boolean|null} options.isFeatured - Filter by featured flag
 * @param {boolean} options.autoFetch - Whether to auto-fetch
 * @param {number} options.pageSize - Items per page
 * @param {string} options.labelQuery - Optional search query for label
 * @param {string} options.fileType - Optional MIME file type (e.g., 'image/', 'video/')
 */
const useMediaFetcher = ({
  type = 'media',
  endpoint = null,
  isActive = true,
  isFeatured = null,
  autoFetch = true,
  pageSize = 10,
  labelQuery = '',
  fileType = '',
}) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [debouncedQuery, setDebouncedQuery] = useState(labelQuery);

  // Debounce logic for label search
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedQuery(labelQuery);
    }, 500);
    return () => clearTimeout(delay);
  }, [labelQuery]);

  const fetchMedia = useCallback(async () => {
    if (type === 'media' && !endpoint) {
      console.warn('[useMediaFetcher] Endpoint is required for media type.');
      setMedia([]);
      setError('Missing endpoint for media type.');
      return;
    }

    setLoading(true);
    try {
      const params = {
        type,
        page,
        page_size: pageSize,
      };
      if (isActive !== null) params.is_active = isActive;
      if (isFeatured !== null) params.is_featured = isFeatured;
      if (endpoint) params.endpoint = endpoint;
      if (debouncedQuery) params.search = debouncedQuery;
      if (fileType) params.file_type = fileType;

      const res = await axiosCommon.get('/media/', { params });
      const data = Array.isArray(res.data?.results) ? res.data.results : res.data;

      setMedia(data);
      setTotalCount(res.data?.count || data.length);
      setHasMore(res.data?.next !== null);
      setError(null);
    } catch (err) {
      console.error('Media fetch error:', err);
      setError('Failed to fetch media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [type, endpoint, isActive, isFeatured, page, pageSize, debouncedQuery, fileType]);

  useEffect(() => {
    if (autoFetch) fetchMedia();
  }, [fetchMedia, autoFetch]);

  const nextPage = () => setPage((prev) => prev + 1);
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return {
    media,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    hasMore,
    setPage,
    nextPage,
    prevPage,
    refetch: fetchMedia,
  };
};

export default useMediaFetcher;
