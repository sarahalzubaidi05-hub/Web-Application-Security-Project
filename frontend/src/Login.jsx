import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userBio, setUserBio] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      axios.get(`http://localhost:8000/api/profile/${parsedUser.username}`)
        .then(res => {
          console.log('Loaded bio:', res.data.bio);
          setUserBio(res.data.bio || '');
        })
        .catch(err => console.error(err));
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
        },
        withCredentials: true
      });
      
      setMessage('Login successful!');
      setUser(response.data.user);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      axios.get(`http://localhost:8000/api/profile/${response.data.user.username}`)
        .then(res => {
          console.log('Loaded bio after login:', res.data.bio);
          setUserBio(res.data.bio || '');
        })
        .catch(err => console.error(err));
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Web Application Vulnerability FYP</h1>
      
      <div className="login-container">
        <div className="login-box">
          {!user ? (
            <>
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
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                
                <button type="submit">LOGIN</button>
                
                {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}
              </form>
              <div style={{marginTop: '20px', textAlign: 'center', width: '100%'}}>
                <p>Don't have an account? <a href="/register" style={{color: '#87CEEB', textDecoration: 'none'}}>Register here</a></p>
              </div>
            </>
          ) : (
            <div className="user-info">
              <h3>Welcome, {user.username}!</h3>
              <p>Email: {user.email}</p>
              <p>User ID: {user.id}</p>
              
              <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <p style={{ color: '#87CEEB', fontSize: '14px', marginBottom: '10px' }}>BIO:</p>
                <div style={{ color: '#fff', fontSize: '14px' }}>
                  {userBio || 'No bio set yet'}
                </div>
              </div>
              <button onClick={() => navigate('/profile')} style={{ marginTop: '15px' }}>
                CUSTOMIZE BIO
              </button>
              
              <button onClick={() => { 
                setUser(null); 
                setUsername(''); 
                setPassword(''); 
                setUserBio('');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
              }}>
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="warning">
        <p>⚠️ THIS IS A SECURE APPLICATION FOR EDUCATIONAL PURPOSES</p>
      </div>
    </div>
  );
}

export default Login;