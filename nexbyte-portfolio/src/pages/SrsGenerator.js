import React, { useContext, useEffect, useState } from 'react';
import { SrsContext } from '../context/SrsContext';
import './SrsGenerator.css';

const SrsGenerator = () => {
  const { srsFullData } = useContext(SrsContext);
  const [srsContent, setSrsContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingMode, setEditingMode] = useState('view'); // 'view', 'manual', 'ai'
  const [aiPrompt, setAiPrompt] = useState('');

  // State for actions like saving or AI editing
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (srsFullData) {
      const generateSrs = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/generate-srs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
            body: JSON.stringify(srsFullData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || 'Failed to generate SRS';
            throw new Error(errorMessage);
          }

          const data = await response.json();
          setSrsContent(data.srsContent);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      generateSrs();
    }
  }, [srsFullData]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setIsActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('token');
      const clientId = srsFullData?.client?._id;
      if (!clientId) {
        throw new Error('Client ID not found. Cannot save.');
      }

      const response = await fetch('/api/save-srs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ clientId, srsContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save SRS');
      }

      setActionSuccess('SRS document saved successfully!');
      setEditingMode('view');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAiEdit = async () => {
    if (!aiPrompt) {
      setActionError('Please enter an AI prompt.');
      return;
    }
    setIsActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/edit-srs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ srsContent, aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit with AI');
      }

      const data = await response.json();
      setSrsContent(data.srsContent);
      setAiPrompt('');
      setActionSuccess('AI edit complete.');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!srsFullData) {
    return (
      <div className="srs-generator-container">
        <div className="card text-center">
          <div className="card-body">
            <h1 className="card-title">SRS Generator</h1>
            <p className="card-text">Please go to the <a href="/admin/srs-generator">Admin Panel</a> to generate an SRS document.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="srs-generator-container">
            <div className="card text-center">
                <div className="card-body">
                    <h1 className="card-title">Generating SRS...</h1>
                    <p className="card-text">Please wait while we generate the detailed SRS document for you.</p>
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="srs-generator-container">
            <div className="card text-center">
                <div className="card-body">
                    <h1 className="card-title">Error</h1>
                    <p className="card-text">{error}</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="srs-generator-container">
      <div className="srs-output">
        {editingMode === 'manual' ? (
          <textarea
            className="srs-textarea"
            value={srsContent}
            onChange={(e) => setSrsContent(e.target.value)}
            disabled={isActionLoading}
          />
        ) : (
          <pre>{srsContent}</pre>
        )}

        {editingMode === 'ai' && (
          <div className="ai-prompt-container">
            <input
              type="text"
              className="ai-prompt-input"
              placeholder="Enter your editing instructions... (e.g., 'Make it more formal')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isActionLoading}
            />
            <button onClick={handleAiEdit} className="btn btn-secondary" disabled={isActionLoading}>
              {isActionLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        )}

        <div className="action-feedback">
          {actionError && <p className="text-danger">{actionError}</p>}
          {actionSuccess && <p className="text-success">{actionSuccess}</p>}
        </div>

        <div className="text-center mt-4 action-buttons">
          {editingMode === 'view' ? (
            <>
              <button onClick={handlePrint} className="btn btn-secondary">Print SRS</button>
              <button onClick={() => setEditingMode('manual')} className="btn btn-primary">Edit Manually</button>
              <button onClick={() => setEditingMode('ai')} className="btn btn-primary">Edit with AI</button>
              <button onClick={handleSave} className="btn btn-success" disabled={isActionLoading}>
                {isActionLoading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditingMode('view')} className="btn btn-secondary" disabled={isActionLoading}>Back to View</button>
              <button onClick={handleSave} className="btn btn-success" disabled={isActionLoading}>
                {isActionLoading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SrsGenerator;