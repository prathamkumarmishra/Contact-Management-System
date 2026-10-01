type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
      error?: {
        details?: Array<{ message?: string }>;
      };
    };
  };
};

/** Converts backend and network errors into a useful message for the auth UI. */
export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiErrorShape;
  const details = apiError.response?.data?.error?.details;

  if (Array.isArray(details) && details.length > 0) {
    const messages = details
      .map((detail) => detail.message)
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) return messages.join(' ');
  }

  if (apiError.response?.data?.message) return apiError.response.data.message;

  if (!apiError.response) {
    return 'We could not reach the service. Please check your connection and try again.';
  }

  return fallback;
}
