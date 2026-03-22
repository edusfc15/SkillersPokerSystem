import { Card, CardContent, CardHeader, CardTitle } from '@skillers/ui';
import { useAuth } from '../contexts/auth-context';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          👤 Perfil do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
            {user.displayName?.[0]?.toUpperCase() || user.username[0]?.toUpperCase() || '👤'}
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            {user.displayName || user.username}
          </h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">E-mail:</span>
            <span className="text-sm text-foreground">{user.email}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">ID:</span>
            <span className="text-sm text-foreground font-mono">{user.id.slice(0, 8)}...</span>
          </div>

          {user.roles && user.roles.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Funções:</span>
              <div className="flex gap-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.emailConfirmed !== undefined && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Email Confirmado:</span>
              <span className={`text-sm ${user.emailConfirmed ? 'text-success' : 'text-warning'}`}>
                {user.emailConfirmed ? '✅ Sim' : '⏳ Pendente'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
        >
          🚪 Sair da Conta
        </button>
      </CardContent>
    </Card>
  );
}
