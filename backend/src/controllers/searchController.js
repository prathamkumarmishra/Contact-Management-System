const cppBridge = require('../services/cppBridge');
const SearchHistory = require('../models/SearchHistory');
const responseHandler = require('../utils/responseHandler');

/**
 * Autocomplete prefix search (C++ Trie)
 */
exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return responseHandler.success(res, 'Empty search query', { results: [] });
    }

    const queryStr = q.trim();

    // Query C++ Engine via Trie search
    const cppResult = await cppBridge.sendCommand('search', { query: queryStr });

    // Store search history auditing in MongoDB (non-blocking)
    SearchHistory.create({
      userId: req.user.id,
      query: queryStr,
      resultCount: cppResult.results ? cppResult.results.length : 0
    }).catch(err => console.error('⚠️ Failed to save search history:', err.message));

    return responseHandler.success(
      res,
      `Found ${cppResult.results ? cppResult.results.length : 0} prefix matches in C++ engine`,
      { results: cppResult.results || [] }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve recent search query logs (C++ Queue)
 */
exports.getSearchHistory = async (req, res, next) => {
  try {
    // Query C++ FIFO Queue history
    const cppResult = await cppBridge.sendCommand('getHistory');
    
    return responseHandler.success(
      res,
      'Recent search history retrieved successfully',
      { history: cppResult.history || [] }
    );
  } catch (error) {
    next(error);
  }
};
