import { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

function Welcome() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [currentBio, setCurrentBio] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadBio(parsedUser.username);
    }
  }, []);

  const loadBio = async (username) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/profile/${username}`, {
        withCredentials: true
      });
      setCurrentBio(response.data.bio || '');
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
          username: user.username,
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  };

  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="page-container">
      <h1 className="main-title">Welcome to FYP Dashboard</h1>

      <div className="login-container">
        <div className="login-box">
          <div className="user-info">
            <h3>Welcome, {user.username}!</h3>
            <p>Email: {user.email}</p>
            <p>User ID: {user.id}</p>
          </div>

          <div style={{marginTop: '30px'}}>
            <h4>Your Bio:</h4>
            <div style={{
              padding: '15px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #87CEEB',
              borderRadius: '5px',
              marginBottom: '20px',
              minHeight: '60px',
              color: '#fff'
            }}>
              {currentBio || 'No bio yet'}
            </div>

            <form onSubmit={handleUpdateBio}>
              <div className="form-group">
                <label>UPDATE BIO:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter your bio (XSS test: <script>alert('XSS')</script>)"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #87CEEB',
                    borderRadius: '5px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button type="submit">UPDATE BIO</button>

              {message && <p className={message.includes('success') ? 'success' : 'error'}>{message}</p>}
            </form>

            <button onClick={handleLogout} style={{marginTop: '20px'}}>LOGOUT</button>
          </div>
        </div>
      </div>

      <div className="warning">
        <p>⚠ THIS IS A SECURE APPLICATION FOR EDUCATIONAL PURPOSES</p>
      </div>
    </div>
  );
}

export default Welcome;
