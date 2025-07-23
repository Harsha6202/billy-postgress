import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ExperienceForm from './experiences/ExperienceForm';
import ExperienceCard from './experiences/ExperienceCard';

const ExperienceSharing: React.FC = () => {
  const { user } = useAuth();
  const { experiences, addExperience, loading, error } = useData();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      if (!user) return;
      
      console.log('Submitting experience:', data);
      const experienceData = {
        userId: user.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        isAnonymous: data.isAnonymous,
        author: {
          username: data.isAnonymous ? 'Anonymous' : user.username,
          avatarUrl: undefined
        }
      };
      
      await addExperience(experienceData);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting experience:', error);
    }
  };

  const handleLike = async (experienceId: string) => {
    try {
      if (!user) return;
      // TODO: Implement like functionality
      console.log('Like experience:', experienceId);
    } catch (error) {
      console.error('Error liking experience:', error);
    }
  };

  const handleComment = async (experienceId: string, data: { content: string; isAnonymous: boolean }) => {
    try {
      if (!user) return;
      // TODO: Implement comment functionality
      console.log('Add comment:', experienceId, data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700">Loading experiences...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            <h2 className="text-2xl font-bold">Community Experiences</h2>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Share Your Story
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <ExperienceForm onSubmit={handleSubmit} />
          </div>
        )}

        <div className="space-y-6">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
          
          {experiences.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No experiences shared yet. Be the first to share your story!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSharing;