import { useState, useEffect, useCallback } from 'react';
import { services } from '@/services/ServiceContainer';
import { User, UserRole } from '@/domain/models/User';

export function useAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await services.databaseService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      setError('Erro ao carregar lista de usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await services.databaseService.updateUserRole(userId, newRole);
      await loadUsers(); // reload list
    } catch (err: any) {
      setError('Erro ao atualizar papel do usuário.');
    }
  };

  const createTrainer = async (name: string, email: string) => {
    try {
      const newTrainer = new User({
        id: `coach-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        role: 'trainer',
        createdAt: new Date()
      });
      await services.databaseService.createUser(newTrainer);
      await loadUsers();
    } catch (err: any) {
      setError('Erro ao cadastrar treinador: ' + err.message);
    }
  };

  return {
    users,
    loading,
    error,
    changeUserRole,
    createTrainer,
    refreshUsers: loadUsers
  };
}
