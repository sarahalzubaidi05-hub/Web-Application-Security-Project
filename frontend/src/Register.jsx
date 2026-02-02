import { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    // NO VALIDATION - INTENTIONALLY INSECURE
    try {
      const response = await axios.post('http://localhost:8000/api/register', null, {
        params: {
          username: username,
          email: email,
          password: password
        }
      });

      setMessage('Registration successful! You can now login.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="page-container">
      <h1 className="main-title">Create New Account</h1>

      <div className="login-container">
        <div className="login-box">
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>USERNAME:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                required
              />
            </div>

            <div className="form-group">
              <label>EMAIL:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD:</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                required
              />
            </div>

            <button type="submit">REGISTER</button>

            {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}
          </form>

          <div style={{marginTop: '20px', textAlign: 'center', width: '100%'}}>
            <p>Already have an account? <a href="/" style={{color: '#87CEEB', textDecoration: 'none'}}>Login here</a></p>
          </div>
        </div>
      </div>

      <div className="warning">
        <p>⚠ THIS IS A VULNERABLE APPLICATION FOR EDUCATIONAL PURPOSES ONLY</p>
      </div>
    </div>
  );
}

export default Register;
