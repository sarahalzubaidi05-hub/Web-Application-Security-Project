import { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    if (strength === 5) return 'Strong';
    if (strength >= 3) return 'Medium';
    return 'Weak';
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register', null, {
        params: {
          username: username,
          email: email,
          password: password
        },
        withCredentials: true
      });

      setMessage('Registration successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="page-container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>
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
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Create password"
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
              {password && (
                <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                  Strength: {passwordStrength}
                </p>
              )}
              <p className="password-hint">
                Must include: 8+ chars, uppercase, lowercase, number, special character
              </p>
            </div>

            <div className="form-group">
              <label>CONFIRM PASSWORD:</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
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
        <p>⚠ THIS IS A SECURE APPLICATION FOR EDUCATIONAL PURPOSES</p>
      </div>
    </div>
  );
}

export default Register;
