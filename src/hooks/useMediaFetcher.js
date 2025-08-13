import { useEffect, useState, useCallback } from 'react';
import apiService from '../api/apiService';
import API from '../api/api';

/**
 * Hook to fetch media (or banners) from specific endpoints with pagination, filtering, and search.
 *
 * @param {Object} options
 * @param {string} options.endpoint - Key from API.media mapping in api.js (e.g., 'about', 'banners', 'vendors', 'partners')
 * @param {boolean|null} options.isActive - Filter by active status
 * @param {boolean|null} options.isFeatured - Filter by featured flag
 * @param {boolean} options.autoFetch - Whether to auto-fetch on mount
 * @param {number} options.pageSize - Items per page
 * @param {string} options.labelQuery - Optional search query for label
 * @param {string} options.fileType - Optional MIME file type (e.g., 'image/', 'video/')
 */
const useMediaFetcher = ({
  endpoint = 'about',
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

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedQuery(labelQuery), 400);
    return () => clearTimeout(delay);
  }, [labelQuery]);

  const fetchMedia = useCallback(async () => {
    // ✅ Ensure we are checking inside API.media
    if (!API.media || !API.media[endpoint]) {
      console.warn(`[useMediaFetcher] Unknown media endpoint key: ${endpoint}`);
      setError('Invalid media endpoint');
      setMedia([]);
      return;
    }

    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (isActive !== null) params.is_active = isActive;
      if (isFeatured !== null) params.is_featured = isFeatured;
      if (debouncedQuery) params.search = debouncedQuery;
      if (fileType) params.file_type = fileType;

      const res = await apiService.get(API.media[endpoint], { params });
      const results = Array.isArray(res.data?.results) ? res.data.results : res.data;

      setMedia(results);
      setTotalCount(res.data?.count || results.length);
      setHasMore(Boolean(res.data?.next));
      setError(null);
    } catch (err) {
      console.error(`Error fetching media from ${endpoint}:`, err);
      setError('Failed to fetch media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, isActive, isFeatured, page, pageSize, debouncedQuery, fileType]);

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
