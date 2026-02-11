import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Profile() {
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      setUsername(user.username);
      
      // Load existing bio
      axios.get(`http://localhost:8000/api/profile/${user.username}`)
        .then(res => {
          setBio(res.data.bio || '');
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/profile', null, {
        params: { username, bio }
      });
      setMessage('Bio saved successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setMessage('Error saving bio');
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Web Application Vulnerability FYP</h1>
      <div className="login-container">
        <div className="login-box">
          <h2 style={{ color: '#87CEEB', textAlign: 'center', marginBottom: '30px', textTransform: 'uppercase' }}>Your Profile</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>USERNAME:</label>
              <input 
                type="text"
                value={username}
                disabled
                style={{ background: 'rgba(0,0,0,0.3)', cursor: 'not-allowed', color: '#666' }}
              />
            </div>

            <div className="form-group">
              <label>BIO:</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows="6"
                style={{ 
                  width: '100%', 
                  padding: '14px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '2px solid #87CEEB',
                  borderRadius: '5px',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: "'Courier New', monospace",
                  resize: 'vertical'
                }}
              />
            </div>

            <button type="submit">SAVE BIO</button>
          </form>

          {message && <p style={{ color: '#00ffff', marginTop: '15px', textAlign: 'center' }}>{message}</p>}

          <button 
            onClick={() => navigate('/')}
            style={{ marginTop: '20px' }}
          >
            ← BACK TO LOGIN
          </button>

          <div className="warning" style={{ marginTop: '20px' }}>
            <p>⚠️ SECURE VERSION - XSS PROTECTED WITH HTML.ESCAPE()! ⚠️</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;