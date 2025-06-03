import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { User } from '../types'; // Assuming User type is available

interface LoginPageProps {
  onLogin: (user: User) => void;
  mockUsers: User[]; // Pass mockUsers for now
}

export function LoginPage({ onLogin, mockUsers }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    // Find user in mockUsers (replace with actual auth later)
    const user = mockUsers.find(
      (u) => u.username === username // && u.password === password // Add password check if available
    );

    if (user) {
      // For now, any password works for the demo if the user exists
      // In a real app, you'd hash and compare the password
      onLogin(user);
      navigate('/'); // Redirect to homepage after login
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="container py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">
            Access your PokéTrade Hub account
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-error-500">{error}</p>}
          <Button type="submit" className="w-full">
            Log In
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-primary-600 hover:underline">
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
} 