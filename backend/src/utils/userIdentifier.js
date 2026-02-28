/**
 * Получает идентификатор пользователя для поиска конфигов
 * @param {Object} user - Объект пользователя { id, username, firstName, lastName }
 * @returns {string} Идентификатор пользователя
 */
export function getUserIdentifier(user) {
  return user.username || `user_${user.id}`;
}
