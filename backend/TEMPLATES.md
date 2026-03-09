# Documentation Templates

## Function Template
```javascript
/**
 * Brief description of what the function does
 *
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.name - Name of album (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Description of album (optional) with explanation of how it's used
 * @param {string} req.params.id - Album ID for lookup with explanation of generation method and validation rules
 * @returns {Promise<void>} Description of what is returned
 * @throws {NotFoundError} If album not found with specific explanation of why no album was found
 * @throws {ClientFaultError} If validation fails or invalid data provided with clear explanation of what caused the error  
 * @throws {ServerFaultError} If database operation fails due to server-side issues with detailed context
 * @example
 * // Example usage:
 * POST /api/album
 * {
 *   "name": "Amazing Grace Album",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates creating a new album with associated songs.
 */
```

## Error Handling Template
```javascript
/**
 * @throws {NotFoundError} If album not found with specific explanation of why no album was found
 * @throws {ClientFaultError} If validation fails or invalid data provided with clear explanation of what caused the error  
 * @throws {ServerFaultError} If database operation fails due to server-side issues with detailed context
 */
```

## Parameter Documentation Template
```javascript
/**
 * @param {Object} req - Express request object containing request data
 * @param {string} req.body.name - Name of album (required, 2-100 characters) with description of content constraints, character limits, and validation rules
 * @param {string} [req.body.description] - Description of album (optional) with explanation of how it's used
 */
```

## Return Value Template
```javascript
/**
 * @returns {Promise<void>} Description of what is returned
 */
```

## Usage Example Template
```javascript
/**
 * @example
 * // Example usage:
 * POST /api/album
 * {
 *   "name": "Amazing Grace Album",
 *   "songs": ["song-456"]
 * }
 * This example demonstrates creating a new album with associated songs.
 */
```