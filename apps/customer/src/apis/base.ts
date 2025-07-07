import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { isEmpty } from 'lodash';
// import { toast } from 'react-toastify';

// SERVICES
import { getAccessToken, logoutSuccess } from 'services/authService';

// CONSTANTS
import { API_HOSTNAME } from 'constants/environments';

declare module 'axios' {
  interface AxiosRequestConfig {
    options?: {
      silenceSuccess?: boolean; // don't display notification when success
      silence?: boolean; // don't display notification when success and failure
    };
  }
}

type Interceptor = {
  onRequest?: (requestConfig: AxiosRequestConfig) => AxiosRequestConfig;
  onRequestError?: (error: AxiosError) => Promise<AxiosError>;
  onResponse?: (response: AxiosResponse) => AxiosResponse;
  onResponseError?: (error: AxiosError) => Promise<AxiosError>;
};

/**
 * AUTH INTERCEPTORS
 */
const authInterceptor: Interceptor = {
  onRequest: ({ headers, ...restConfigs }) => ({
    ...restConfigs,
    headers: {
      ...headers,
      Authorization: 'Bearer ' + getAccessToken(),
    },
  }),
  onResponseError: error => {
    if (error?.response?.status === 401) {
      logoutSuccess();
      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    }

    return Promise.reject(error);
  },
};

/**
 * NOTIFICATION INTERCEPTORS
 */
const notificationInterceptor: Interceptor = {
  onResponse: response => {
    const {
      data,
      config: { method, options },
    } = response;
    const requestMethod = method?.toLocaleUpperCase() || 'GET';

    if (requestMethod !== 'GET' && !(options?.silenceSuccess || options?.silence)) {
      // toast.success(data.message);
      console.log(data);
    }

    return response;
  },
  onResponseError: error => {
    // timeout, request cancelled

    if (error.code === 'ECONNABORTED') {
      // toast.error('Request timeout. Please try it again');
    } else if (error?.response?.data) {
      const { errors, message } = error.response.data;
      const {
        config: { options },
      } = error.response;
      if (!isEmpty(errors)) {
        errors.forEach((e: { message: string }) => {
          if (e.message && !options?.silence) {
            // toast.error(e.message);
          }
        });
      } else if (message && !options?.silence) {
        // toast.error(message);
      }
    }

    return Promise.reject(error);
  },
};

/**
 * EXPORT INTERCEPTORS
 */
const exportInterceptor: Interceptor = {
  onRequest: ({ params, ...restConfigs }) => ({
    ...restConfigs,
    responseType: 'blob',
    params: {
      ...params,
      access_token: getAccessToken(),
    },
  }),
  // notify when error only
  onResponseError: async error => {
    // timeout, request cancelled
    if (error.code === 'ECONNABORTED') {
      // toast.error('Request timeout. Please try it again');
    } else if (error?.response?.data) {
      const errorResponseString = await error?.response?.data.text();

      if (errorResponseString) {
        const errorResponse = JSON.parse(errorResponseString);
        const { errors, message } = errorResponse;
        if (!isEmpty(errors)) {
          errors.forEach((e: { message: string }) => {
            if (e.message) {
              // toast.error(e.message);
            }
          });
        } else if (message) {
          // toast.error(message);
        }

        return Promise.reject(errorResponse);
      }
    }

    return Promise.reject(error);
  },
};

/**
 * GENERAL INTERCEPTORS
 */
// Transform response, return data from response only
const dataInterceptor: Interceptor = {
  // onResponse: ({ data }) => data, // transform data
  onResponseError: error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response fail', error.response);
      if (error.response.status < 511) {
        return Promise.reject(error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('Request fail', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }

    return Promise.reject(error);
  },
};

type RequestConfigs = {
  baseURL?: string;
  timeout?: number;
};

const createRequestInstance = (
  { baseURL = API_HOSTNAME || '', timeout = 60000 }: RequestConfigs = {},
  interceptors?: Interceptor[]
) => {
  const config: AxiosRequestConfig = {
    baseURL,
    timeout,
    headers: {},
  };

  const request = axios.create(config);

  (interceptors || []).forEach(interceptor => {
    if (interceptor.onRequest || interceptor.onRequestError) {
      request.interceptors.request.use(interceptor.onRequest, interceptor.onRequestError);
    }

    if (interceptor.onResponse || interceptor.onResponseError) {
      request.interceptors.response.use(interceptor.onResponse, interceptor.onResponseError);
    }
  });

  request.interceptors.response.use(dataInterceptor.onResponse, dataInterceptor.onResponseError);

  return request;
};

export const authRequest = createRequestInstance({});

export const pmsRequest = createRequestInstance({}, [authInterceptor, notificationInterceptor]);

export const exportRequest = createRequestInstance({}, [exportInterceptor]);
