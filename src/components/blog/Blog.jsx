import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import BlogService from "../../api/services/blogService";
import "./blog.css";

// ==========================
// Blog List Page
// ==========================
export function BlogList() {
  const { categorySlug } = useParams(); // optional category filter
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedPosts = await BlogService.getPosts();
        setPosts(fetchedPosts);

        const fetchedCategories = await BlogService.getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to fetch blog data:", err);
        setError("Unable to load blog data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [location]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;

  // Filter by search and category
  const filteredPosts = posts
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !categorySlug || p.category?.slug === categorySlug);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blog Hub</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-lg mb-6"
      />

      {/* Categories */}
      <div className="flex gap-3 flex-wrap mb-6">
        <Button asChild variant={!categorySlug ? "primary" : "outline"}>
          <Link to="/blog">All</Link>
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            asChild
            variant={categorySlug === cat.slug ? "primary" : "outline"}
          >
            <Link to={`/blog/category/${cat.slug}`}>{cat.name}</Link>
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No posts found.</p>
        )}
        {filteredPosts.map((post) => (
          <Card key={post.id} className="shadow-md rounded-2xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-56 object-cover rounded-t-2xl"
            />
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.content.slice(0, 120)}...</p>
              <Button asChild>
                <Link to={`/blog/${post.slug}`}>Read More</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==========================
// Blog Detail Page
// ==========================
export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const fetchedPost = await BlogService.getPostDetail(slug);
        setPost(fetchedPost);

        const fetchedComments = await BlogService.getComments(slug);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Failed to fetch post data:", err);
        setError("Unable to load post details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await BlogService.addComment(slug, { content: commentContent });
      setCommentContent("");
      const refreshedComments = await BlogService.getComments(slug);
      setComments(refreshedComments);
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;
  if (!post) return <p className="text-center p-6">Post not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-4">
        {new Date(post.created_at).toLocaleDateString()} | {post.category?.name}
      </p>
      <img src={post.featured_image} alt={post.title} className="w-full rounded-lg mb-6" />
      <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Social Media */}
      {post.youtube_url && (
        <div className="mb-6">
          <iframe
            width="100%"
            height="400"
            src={post.youtube_url.replace("watch?v=", "embed/")}
            title="YouTube video"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      )}
      {post.tiktok_url && (
        <blockquote
          className="tiktok-embed"
          cite={post.tiktok_url}
          data-video-id={post.tiktok_url.split("/").pop()}
        >
          <a href={post.tiktok_url}>Watch on TikTok</a>
        </blockquote>
      )}

      {/* Share Buttons */}
      <div className="flex gap-3 mb-6">
        <Button asChild variant="outline">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer">
            <Facebook className="w-5 h-5" /> Share
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener noreferrer">
            <Twitter className="w-5 h-5" /> Tweet
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-5 h-5" /> LinkedIn
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={window.location.href} target="_blank" rel="noopener noreferrer">
            <Share2 className="w-5 h-5" /> Copy Link
          </a>
        </Button>
      </div>

      {/* Comments */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg mb-2"
          />
          <Button type="submit">Post Comment</Button>
        </form>

        {comments?.length === 0 && <p className="text-gray-500">No comments yet.</p>}
        {comments?.map((c, i) => (
          <div key={i} className="border-b py-3">
            <p className="font-semibold">{c.user || "Guest"}</p>
            <p>{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { BlogList, BlogDetail };
