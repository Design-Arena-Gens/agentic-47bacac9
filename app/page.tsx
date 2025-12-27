'use client';

import { useState } from 'react';
import axios from 'axios';

interface Platform {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  apiKey: string;
  accessToken: string;
}

interface PostStatus {
  platform: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function Home() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'youtube', name: 'YouTube', icon: '📹', enabled: false, apiKey: '', accessToken: '' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', enabled: false, apiKey: '', accessToken: '' },
    { id: 'instagram', name: 'Instagram', icon: '📷', enabled: false, apiKey: '', accessToken: '' },
  ]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postStatuses, setPostStatuses] = useState<PostStatus[]>([]);

  const togglePlatform = (id: string) => {
    setPlatforms(platforms.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const updatePlatformCredentials = (id: string, field: 'apiKey' | 'accessToken', value: string) => {
    setPlatforms(platforms.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setVideoUrl('');
    }
  };

  const handlePost = async () => {
    const enabledPlatforms = platforms.filter(p => p.enabled);

    if (enabledPlatforms.length === 0) {
      alert('Please enable at least one platform');
      return;
    }

    if (!videoFile && !videoUrl) {
      alert('Please upload a video or provide a video URL');
      return;
    }

    if (!title) {
      alert('Please enter a title');
      return;
    }

    setIsPosting(true);
    setPostStatuses(enabledPlatforms.map(p => ({
      platform: p.name,
      status: 'pending'
    })));

    try {
      const formData = new FormData();
      if (videoFile) {
        formData.append('video', videoFile);
      } else {
        formData.append('videoUrl', videoUrl);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('platforms', JSON.stringify(enabledPlatforms));

      const response = await axios.post('/api/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPostStatuses(response.data.results);
    } catch (error) {
      console.error('Error posting video:', error);
      setPostStatuses(enabledPlatforms.map(p => ({
        platform: p.name,
        status: 'error',
        message: 'Failed to post video'
      })));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            🚀 Social Media Video Poster
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Post your videos to multiple platforms automatically
          </p>

          {/* Platform Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Platforms</h2>
            <div className="space-y-4">
              {platforms.map(platform => (
                <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={platform.id}
                      checked={platform.enabled}
                      onChange={() => togglePlatform(platform.id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={platform.id} className="ml-3 text-lg font-medium cursor-pointer">
                      <span className="text-2xl mr-2">{platform.icon}</span>
                      {platform.name}
                    </label>
                  </div>

                  {platform.enabled && (
                    <div className="ml-8 space-y-2">
                      <input
                        type="text"
                        placeholder="API Key / Client ID"
                        value={platform.apiKey}
                        onChange={(e) => updatePlatformCredentials(platform.id, 'apiKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Access Token / OAuth Token"
                        value={platform.accessToken}
                        onChange={(e) => updatePlatformCredentials(platform.id, 'accessToken', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload from device
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="text-center text-gray-500">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoFile(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Video Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter video description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={isPosting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting ? '🔄 Posting...' : '🚀 Post to All Platforms'}
          </button>

          {/* Post Status */}
          {postStatuses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post Status</h2>
              <div className="space-y-3">
                {postStatuses.map((status, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      status.status === 'success'
                        ? 'bg-green-100 border border-green-300'
                        : status.status === 'error'
                        ? 'bg-red-100 border border-red-300'
                        : 'bg-yellow-100 border border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {status.platform}
                      </span>
                      <span>
                        {status.status === 'success' && '✅ Posted'}
                        {status.status === 'error' && '❌ Failed'}
                        {status.status === 'pending' && '⏳ Posting...'}
                      </span>
                    </div>
                    {status.message && (
                      <p className="text-sm mt-2 text-gray-700">{status.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Setup Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li><strong>YouTube:</strong> Get API credentials from Google Cloud Console (YouTube Data API v3)</li>
              <li><strong>TikTok:</strong> Apply for TikTok Developer access and get API credentials</li>
              <li><strong>Instagram:</strong> Use Facebook Graph API with Instagram Business Account</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              Note: This is a demo interface. Actual posting requires valid API credentials and proper OAuth authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
