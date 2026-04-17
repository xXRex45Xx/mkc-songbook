# MKC Choir Backend Documentation Style Guide

## Overview
This document defines the standard documentation patterns for JSDoc comments in this codebase to ensure consistency, readability, and machine parseability.

## Function Documentation Format

### General Structure
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
 */
```

## Parameter Documentation Standards

### Format Consistency
All parameter documentation must follow this pattern:
```javascript
@param {Type} param.name - Description of parameter with specific constraints and validation rules
```

### Required/Optional Indicators
- Use `[param.name]` for optional parameters
- Use `param.name` for required parameters
- Include constraint information (min, max, length limits)

### Examples of Parameter Descriptions
```javascript
// Required string parameter with character limits
@param {string} req.body.name - Name of album (required, 2-100 characters) with description of content constraints, character limits, and validation rules

// Optional parameter with explanation  
@param {string} [req.body.description] - Description of album (optional) with explanation of how it's used
```

## Error Documentation Standards

### Consistent Error Handling
All functions must document all possible errors they can throw:

```javascript
/**
 * @throws {NotFoundError} If album not found with specific explanation of why no album was found
 * @throws {ClientFaultError} If validation fails or invalid data provided with clear explanation of what caused the error  
 * @throws {ServerFaultError} If database operation fails due to server-side issues with detailed context
 */
```

## JSDoc Tag Usage

### Consistent Formatting
- Use 3 spaces for indentation in JSDoc comments
- Maintain consistent spacing between sections
- Use descriptive, concise language

### Required Tags
Every function should include:
- `@param` for all parameters (required and optional)
- `@returns` for return value descriptions
- `@throws` for all possible errors

## Return Value Documentation

```javascript
/**
 * @returns {Promise<void>} Description of what is returned
 */
```

## Examples Section

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

## Documentation Best Practices

1. **Consistent Terminology**: Use the same terminology throughout the codebase
2. **Clear Descriptions**: Explain what each parameter does and why it's needed
3. **Complete Error Coverage**: Document all possible error conditions
4. **Proper Examples**: Include relevant examples showing usage patterns
5. **Type Consistency**: Always specify types for parameters (Object, string, number, etc.)
6. **Constraint Information**: Include validation constraints in descriptions
7. **Contextual Explanations**: Explain how parameters are used in the function flow

## File Organization
Documentation should be placed immediately before the function it describes.

## Version Control Considerations
- All documentation changes should be reviewed with git diff before committing
- Documentation should be updated alongside code changes