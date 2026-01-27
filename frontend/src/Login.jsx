import { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Check for existing token on page load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/login', null, {
        params: {
          username: username,
          password: password
        }
      });

      setMessage('Login successful!');
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setMessage('');
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Web Application Vulnerability FYP</h1>

      <div className="login-container">
        <div className="login-box">
          {!user ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>USERNAME:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label>PASSWORD:</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit">LOGIN</button>

              {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}
            </form>
          ) : (
            <div className="user-info">
              <h3>Welcome, {user.username}!</h3>
              <p>Email: {user.email}</p>
              <p>User ID: {user.id}</p>
              <button onClick={handleLogout}>LOGOUT</button>
            </div>
          )}

          <div style={{marginTop: '20px', textAlign: 'center', width: '100%'}}>
            <p>Don't have an account? <a href="/register" style={{color: '#87CEEB', textDecoration: 'none'}}>Register here</a></p>
          </div>
        </div>
      </div>

      <div className="warning">
        <p>⚠ THIS IS A VULNERABLE APPLICATION FOR EDUCATIONAL PURPOSES ONLY</p>
      </div>
    </div>
  );
}

export default Login;
