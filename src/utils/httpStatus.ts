export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  } as const;
  
  export const HTTP_MESSAGE = {
    OK: "Success",
    CREATED: "Resource Created Successfully",
    NO_CONTENT: "No Content",
    BAD_REQUEST: "Invalid Request Data",
    UNAUTHORIZED: "Unauthorized Access",
    FORBIDDEN: "Access Denied",
    NOT_FOUND: "Resource Not Found",
    CONFLICT: "Data Conflict",
    TOO_MANY_REQUESTS: "Too Many Requests, Slow Down",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
  } as const;
