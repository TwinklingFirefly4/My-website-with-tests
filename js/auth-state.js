/**
 * Менеджер состояния аутентификации (Singleton)
 * @module auth-state
 * @class AuthState
 */

import supabase from "./supabase-init.js";

class AuthState {
  static instance = null;

  /**
   * Создает экземпляр AuthState (Singleton)
   * @constructor
   */
  constructor() {
    if (AuthState.instance) return AuthState.instance;
    this._callbacks = [];
    this._session = null;
    this._init();
    AuthState.instance = this;
  }

  /**
   * Инициализирует подписки на изменения состояния аутентификации
   * @private
   */
  _init() {
    this._setupSessionListener();
    this._setupAuthStateListener();
    this._setupStorageListener();
  }

  /**
   * Загружает текущую сессию
   * @private
   */
  _setupSessionListener() {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        this._session = data.session;
        this._notifyAll();
      })
      .catch((error) => {
        if (error.message.includes("Auth session missing")) {
          this._session = null;
          this._notifyAll();
        }
      });
  }

  /**
   * Подписывается на изменения состояния аутентификации
   * @private
   */
  _setupAuthStateListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      this._session = session;
      this._notifyAll();
    });
  }

  /**
   * Подписывается на изменения в localStorage
   * @private
   */
  _setupStorageListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "authState") {
        this._session = JSON.parse(e.newValue);
        this._notifyAll();
      }
    });
  }

  /**
   * Уведомляет всех подписчиков об изменении состояния
   * @private
   */
  _notifyAll() {
    localStorage.setItem("authState", JSON.stringify(this._session));
    this._callbacks.forEach((cb) => cb());
  }

  /**
   * Возвращает текущую сессию
   * @returns {object|null} Текущая сессия пользователя
   */
  get session() {
    return this._session;
  }

  /**
   * Подписывает callback на изменения состояния
   * @param {function} callback - Функция для вызова при изменениях
   * @returns {function} Функция для отмены подписки
   */
  subscribe(callback) {
    this._callbacks.push(callback);
    return () => {
      this._callbacks = this._callbacks.filter((cb) => cb !== callback);
    };
  }
  /**
   * Проверяет, авторизован ли пользователь
   */
  isAuthenticated() {
    return !!this._session;
  }
}

// Экспорт singleton-экземпляра
export const authState = new AuthState();
