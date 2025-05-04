/**
 * Инициализирует и экспортирует клиент Supabase
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Конфигурационные параметры
const SUPABASE_URL = "https://odoctvhcnbqnjialumfq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2N0dmhjbmJxbmppYWx1bWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDMyOTksImV4cCI6MjA2MDg3OTI5OX0.x_THMLng4lSfss5cycCeBh2IVeNinQLFkGEhCGn8cC4";

// Параметры аутентификации
const AUTH_OPTIONS = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

/**
 * Создает и настраивает клиент Supabase
 */
function initializeSupabase() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, AUTH_OPTIONS);
    window.supabase = client; // Для глобального доступа при необходимости
    return client;
  } catch (error) {
    console.error("Ошибка инициализации Supabase:", error);
    throw error;
  }
}

const supabase = initializeSupabase();
// Экспорт клиента для использования в других модулях
export default supabase;