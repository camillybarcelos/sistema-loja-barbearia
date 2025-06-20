import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2, Scissors, ArrowLeft } from 'lucide-react';

// URL da API do backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Ocorreu um erro no cadastro.');
      }
      
      setSuccessMessage('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      
      // Redireciona para o login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Scissors className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Criar Conta
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Preencha os campos para se cadastrar.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Mensagens de erro ou sucesso */}
            {serverError && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{serverError}</div>}
            {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">{successMessage}</div>}

            <div className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('name', { required: 'Nome é obrigatório' })} className="pl-10 w-full rounded-lg" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('email', { required: 'Email é obrigatório', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} type="email" className="pl-10 w-full rounded-lg" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <div className="mt-1 relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Senha precisa ter no mínimo 6 caracteres' } })} type="password" className="pl-10 w-full rounded-lg" />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <Link to="/login" className="flex items-center justify-center gap-2 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
               <ArrowLeft size={16} /> Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 