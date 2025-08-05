import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { UserProfile } from './user-profile';

export function AuthSection() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Se usuário está logado, mostrar perfil
  if (user) {
    return <UserProfile />;
  }

  // Se não está logado, mostrar login/registro
  return (
    <div className="space-y-4">
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      
      <div className="text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {mode === 'login' 
            ? '📝 Não tem conta? Registre-se aqui' 
            : '🔐 Já tem conta? Faça login aqui'
          }
        </button>
      </div>
    </div>
  );
}
