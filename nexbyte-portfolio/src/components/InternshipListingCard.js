import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const InternshipListingCard = ({ internship, onApply }) => {
  const {
    title,
    description,
    company,
    location,
    mode,
    duration,
    stipend,
    skills,
    category,
    applicationDeadline,
    currentApplicants,
    maxApplicants,
    createdAt
  } = internship;

  const isDeadlineNear = new Date(applicationDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isFull = currentApplicants >= maxApplicants;

  const getModeIcon = () => {
    switch (mode) {
      case 'remote':
        return '🏠';
      case 'onsite':
        return '🏢';
      case 'hybrid':
        return '🔄';
      default:
        return '💼';
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'web-development':
        return 'bg-blue-100 text-blue-800';
      case 'mobile-development':
        return 'bg-green-100 text-green-800';
      case 'data-science':
        return 'bg-purple-100 text-purple-800';
      case 'ui-ux':
        return 'bg-pink-100 text-pink-800';
      case 'digital-marketing':
        return 'bg-yellow-100 text-yellow-800';
      case 'content-writing':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 font-medium">{company}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor()}`}>
            {category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2 text-lg">{getModeIcon()}</span>
            <span className="capitalize">{mode}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">⏱️</span>
            <span>{duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💰</span>
            <span>{stipend}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills Required</p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Status Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          <span className={`font-semibold ${isFull ? 'text-red-600' : isDeadlineNear ? 'text-orange-600' : 'text-green-600'}`}>
            {currentApplicants}/{maxApplicants} applicants
          </span>
        </div>

        {/* Deadline Warning */}
        {isDeadlineNear && !isFull && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-orange-800 font-medium">
              ⚠️ Application deadline approaching!
            </p>
          </div>
        )}

        {/* Full Warning */}
        {isFull && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-800 font-medium">
              🚫 Applications closed for this position
            </p>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={() => onApply(internship)}
          disabled={isFull}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 hover:shadow-lg'
          }`}
        >
          {isFull ? 'Applications Closed' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default InternshipListingCard;
