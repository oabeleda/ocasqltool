// SQL History Storage Utility
// Manages the last 100 executed SQL queries with FIFO behavior
// Stores history in a file via Electron IPC for persistence

import { getHistoryFile, saveHistoryFile } from './api';

const MAX_HISTORY_SIZE = 100;

/**
 * Adds a SQL query to history with timestamp
 * Maintains FIFO queue of max 100 items
 */
export const addToHistory = async (sql) => {
  if (!sql || sql.trim() === '') return;

  try {
    const history = await getHistory();

    const entry = {
      sql: sql.trim(),
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random() // Unique ID for React keys
    };

    // Add to beginning of array (most recent first)
    history.unshift(entry);

    // Maintain max size (FIFO - remove oldest)
    if (history.length > MAX_HISTORY_SIZE) {
      history.splice(MAX_HISTORY_SIZE);
    }

    await saveHistoryFile(JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving to SQL history:', error);
  }
};

/**
 * Retrieves all history entries
 * Returns array sorted by timestamp (newest first)
 */
export const getHistory = async () => {
  try {
    const result = await getHistoryFile();
    if (!result.success) {
      console.error('Error reading history file:', result.error);
      return [];
    }

    const history = JSON.parse(result.content);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error reading SQL history:', error);
    return [];
  }
};

/**
 * Groups history entries by date
 * Returns object with date keys and arrays of entries
 */
export const getHistoryGroupedByDate = async () => {
  const history = await getHistory();
  const grouped = {};

  history.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateKey = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(entry);
  });

  return grouped;
};

/**
 * Clears all history
 */
export const clearHistory = async () => {
  try {
    await saveHistoryFile('[]');
  } catch (error) {
    console.error('Error clearing SQL history:', error);
  }
};

/**
 * Gets formatted time for display
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
