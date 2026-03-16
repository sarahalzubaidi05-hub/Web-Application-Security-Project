import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Profile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [currentBio, setCurrentBio] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get username from somewhere - you might need to store it in state or get from backend
    const storedUsername = localStorage.getItem('current_username');
    if (storedUsername) {
      setUsername(storedUsername);
      loadBio(storedUsername);
    }
  }, []);

  const loadBio = async (user) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/profile/${user}`, {
        withCredentials: true
      });
      setCurrentBio(response.data.bio || 'No bio yet');
    } catch (error) {
      console.error('Error loading bio:', error);
    }
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await axios.post('http://localhost:8000/api/profile', null, {
        params: {
          username: username,
          bio: bio
        },
        withCredentials: true
      });

      setMessage('Bio updated successfully!');
      setCurrentBio(bio);
      setBio('');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to update bio');
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Profile Page</h1>

      <div className="login-container">
        <div className="login-box">
          <h3>Current Bio:</h3>
          <div style={{
            padding: '15px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #87CEEB',
            borderRadius: '5px',
            marginBottom: '20px',
            minHeight: '60px',
            color: '#fff'
          }}>
            {currentBio}
          </div>

          <form onSubmit={handleUpdateBio}>
            <div className="form-group">
              <label>UPDATE BIO:</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your bio (try XSS: <script>alert('XSS')</script>)"
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #87CEEB',
                  borderRadius: '5px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <button type="submit">UPDATE BIO</button>

            {message && <p className={message.includes('success') ? 'success' : 'error'}>{message}</p>}
          </form>

          <div style={{marginTop: '20px'}}>
            <button onClick={() => navigate('/')}>Back to Login</button>
          </div>
        </div>
      </div>

      <div className="warning">
        <p>⚠ THIS IS A SECURE APPLICATION - XSS PROTECTED</p>
      </div>
    </div>
  );
}

export default Profile;
