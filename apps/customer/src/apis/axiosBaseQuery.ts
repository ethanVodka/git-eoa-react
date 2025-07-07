import { BaseQueryFn } from '@reduxjs/toolkit/dist/query';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { RootState } from 'app/store';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  ResponseType,
  AxiosResponse,
  AxiosInstance,
} from 'axios';
import { addError } from 'components/dialogError/dialogErrorSlice';
import { setIsNeedReload } from 'components/layouts/headers/HeaderSlice';
import {
  resetPageErrorMessage,
  setPageErrorMessage,
} from 'components/messageArea/PageMessageArea/PageMessageAreaSlice';
import { snackbarHandleOpen } from 'components/snackbars/SnackbarSlice';
import CoreConst from 'constants/coreConst';
import ScreenIdEnum from 'constants/screenIdEnum';
import { Any } from 'constants/types';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { setUnauthorized } from 'pages/auth/authSlice';
import { confirmDialog } from 'services/dialogService';

type AxiosRequestHeadersCustom = AxiosRequestHeaders & {
  head: {
    'is-loading': string;
  };
};
export class AxiosInstanceClass {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!AxiosInstanceClass.instance) {
      AxiosInstanceClass.instance = axios.create({
        headers: {
          // サーバー側でAjax通信かの判定に使用する、jQueryでAjax通信した時に設定されるものと合わせている
          'X-Requested-With': 'XMLHttpRequest',
        },
        // リクエストが正常に終了した時にSnackBarで表示するメッセージ（未設定の場合は何も出さない）
        successMessageType: '',
        // 特定のHTTPステータスは自分自身でハンドリングを行いたい場合に対象のステータスを設定する、デフォルトは空
        selfErrorHandlingStatus: [],
        // ローディングを表示するか、デフォルトは表示する
        loading: true,
      } as AxiosRequestConfig);
    }
    return AxiosInstanceClass.instance;
  }
}

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const transformer: AxiosRequestTransformer = data => {
  // skip case download file
  if (data?.data?.type === 'application/octet-stream' || data?.data?.type === 'application/pdf') {
    return data;
  }

  if (typeof data === 'string' && dateFormatRegex.test(data)) {
    // do your specific formatting here
    return moment(data).format(CoreConst.DATE_FORMAT);
  }
  if (Array.isArray(data)) {
    return data.map(val => transformer(val));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(Object.entries(data).map(([key, val]) => [key, transformer(val)]));
  }
  return data;
};

AxiosInstanceClass.getInstance().interceptors.response.use(transformer);

const ERROR_MESSAGE = {
  // Unauthorized
  401: `セッションがタイムアウトしました。\n再度ログインしてください。`,
  // Forbidden
  403: `権限がありません。`,
  // Not Found
  404: `対象データがありません。`,
  // Request Timeout
  408: `要求がタイムアウトしました。`,
  // Conflict
  409: `他のユーザにデータが更新されています。\n画面を再表示してください。`,
  // Payload Too Large
  413: `リクエストサイズが大きすぎます。\nファイルアップロードは1ファイル最大200MBです。`,
  // Too Many Requests
  429: `多くの人がシステムを利用しているため\nリクエストが制限されました。`,
  // Internal Server Error
  500: `システムエラーが発生しました。\nシステム管理者にお問い合わせください。`,
  // Bad Gateway
  502: `ゲートウェイに問題が発生しています。`,
  // Service Unavailable
  503: `メンテナンス中です。\n現在システムは利用できません。`,
  // Gateway Timeout
  504: `応答がタイムアウトしました。`,
};

// List common api endpoint will exclude call count todo
const ExcludeLoadCountTodo: string[] = [
  ScreenIdEnum.BC122.toLowerCase(),
  ScreenIdEnum.BC623.toLowerCase(),
  ScreenIdEnum.BC911.toLowerCase(),
  ScreenIdEnum.BC911.toLowerCase(),
  ScreenIdEnum.TE139.toLowerCase(),
  ScreenIdEnum.EX124.toLowerCase(),
  ScreenIdEnum.EX943.toLowerCase(),
  ScreenIdEnum.SA913.toLowerCase(),
  ScreenIdEnum.SA223.toLowerCase(),
  ScreenIdEnum.PU913.toLowerCase(),
  ScreenIdEnum.SC211.toLowerCase(),
  ScreenIdEnum.SC911.toLowerCase(),
  ScreenIdEnum.SC931.toLowerCase(),
  ScreenIdEnum.SC963.toLowerCase(),
  ScreenIdEnum.SC991.toLowerCase(),
  ScreenIdEnum.SC973.toLowerCase(),
];

// List common api endpoint will exclude inject common param.
const ExcludeInjectCommonParams: string[] = [
  'sc/toHalfKanaForSearch',
  'sc/toHalfWidthCharacter',
  'sc/toJbaRule',
];

// Check common api endpoint
// return true if not exits
const checkExcludeInjectCommonParams = (url?: string) => {
  if (!url) {
    return true;
  }
  const index = ExcludeInjectCommonParams.findIndex((i: string) => url.includes(i));
  return index == -1;
};

// Check common api endpoint
// return true if not exits
const checkExcludeLoadCountTodo = (url?: string) => {
  if (!url) {
    return true;
  }
  const index = ExcludeLoadCountTodo.findIndex((i: string) => url.includes(i));
  return index == -1;
};

// check re-call search
// return true if match all condition
// 1. current page > 1
// 2. search result is empty
const isReCallSearch = (response: AxiosResponse<Any, Any>) => {
  if (
    response.data &&
    response.data.meta &&
    response.data.meta.page > 1 &&
    response.data.results &&
    response.data.results.length === 0
  ) {
    return true;
  }
  return false;
};

export const SNACK_BAR_MESSAGE = {
  registered: '登録されました。',
  check: '処理結果をホーム画面で確認してください。',
  updated: '更新されました。',
  deleted: '削除されました。',
};

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string;
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      successMessageType?: 'registered' | 'check' | 'updated' | 'deleted';
      loading?: boolean;
      screenId?: string;
      isMultipart?: boolean;
      responseType?: ResponseType;
      notFoundCode?: string;
      suffix?: string;
      notShowNotFoundError?: boolean;
    },
    unknown,
    unknown
  > =>
  async (
    {
      url,
      data,
      params,
      successMessageType,
      loading = true,
      screenId,
      isMultipart,
      responseType,
      notFoundCode,
      suffix,
      notShowNotFoundError,
    },
    { dispatch, getState }
  ) => {
    const commonParams = (getState() as RootState).commonParams.present.commonParams;
    const csrfToken = document.cookie.replace(
      /(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
    const headers = {
      head: {
        'is-loading': '0',
      },
    } as AxiosRequestHeadersCustom;

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
    // inject common param ( flow_code, function_code, search_flow_code_list )
    const requestBody =
      isMultipart || !checkExcludeInjectCommonParams(url) ? data : { ...data, ...commonParams };
    //Delete isOpenInDialog not need for callApi
    delete requestBody.isOpenInDialog;

    if (loading) {
      // ローディングを開く
      headers.head['is-loading'] = '1';
    }

    const configAxios: AxiosRequestConfig = {
      url: baseUrl + url,
      method: 'POST',
      data: requestBody,
      params,
      headers,
      responseType,
    };

    try {
      const response = await AxiosInstanceClass.getInstance()(configAxios);
      const config: AxiosRequestConfig = response.config;

      // 初回検索では3ページだった場合で、再検索によって2ページとなった場合は、2ページ目とする。
      let reCallResponse = undefined;
      if (isReCallSearch(response)) {
        const reCallRequestBody = { ...data, page: response.data.meta.page - 1, ...commonParams };
        const reCallConfigAxios: AxiosRequestConfig = {
          url: baseUrl + url,
          method: 'POST',
          data: reCallRequestBody,
          params,
          headers,
          responseType,
        };
        reCallResponse = await AxiosInstanceClass.getInstance()(reCallConfigAxios);
      }

      // 成功時に表示するメッセージが設定されている場合、SnackBarで表示する
      if (successMessageType && SNACK_BAR_MESSAGE[successMessageType]) {
        dispatch(
          snackbarHandleOpen({
            message: SNACK_BAR_MESSAGE[successMessageType],
            severity: 'success',
          })
        );
      }

      // 検索押下時、総件数取得フラグをTrueにする
      if (config.url?.match(/search/) && checkExcludeLoadCountTodo(config.url)) {
        dispatch(setIsNeedReload(true));
      }

      // Reset error message
      dispatch(resetPageErrorMessage(screenId));
      // responseTypeにblobを指定し、content-disposition: attachmentのコンテンツがレスポンスされた場合はファイルに変換してダウンロードさせる
      if (config.responseType === 'blob') {
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const fileName = decodeURIComponent(
            disposition.substring(disposition.indexOf("''") + 2, disposition.length)
          );
          const blob = new Blob([response.data], {
            type: response.data.type,
          });
          saveAs(blob, fileName);
          return { data: undefined };
        }
      }
      // re-call search
      if (isReCallSearch(response)) {
        return { data: reCallResponse?.data };
      }
      return { data: response.data };
    } catch (axiosError) {
      if (!axios.isAxiosError(axiosError)) {
        return { error: { status: axiosError.response?.status, data: axiosError } };
      }
      const err = axiosError as AxiosError;
      let errorMessage;
      let dialogMessage = '';
      if (err.code === 'ECONNABORTED') {
        dialogMessage = `接続が中断されました。`;
      } else if (!err.response) {
        dialogMessage = `通信エラーが発生しました。\nインターネットに接続されていないか\nサーバがダウンしている可能性があります。`;
      } else if (err.response.status === 400) {
        errorMessage = err.response?.data?.messages;
        if (
          err.request?.responseType === 'blob' &&
          err.response?.data instanceof Blob &&
          err.response?.data?.type &&
          err.response?.data?.type?.toLowerCase().indexOf('json') != -1
        ) {
          errorMessage = JSON.parse(await err.response.data.text())?.messages;
        }

        if (errorMessage) {
          if (errorMessage.length > 0) {
            dispatch(setPageErrorMessage({ screenId, errorMessage }));
          } else {
            // dispatch snackbar
            dispatch(
              snackbarHandleOpen({ message: 'エラーメッセージがあります。', severity: 'error' })
            );
          }
        } else {
          dialogMessage = `要求内容に誤りがあります。`;
        }
      } else if (err.response.status === 409) {
        // Dispatch error message
        errorMessage = err.response?.data?.messages;
        if (errorMessage) {
          // if has message, use message
          dialogMessage = errorMessage[0].message;
        } else {
          // use default
          dialogMessage = ERROR_MESSAGE[409];
        }
      } else if (err.response.status === 401) {
        // Dispatch error message
        errorMessage = err.response?.data?.messages;
        if (errorMessage) {
          dispatch(setPageErrorMessage({ screenId, errorMessage }));
          // dispatch snackbar
          dispatch(
            snackbarHandleOpen({ message: 'エラーメッセージがあります。', severity: 'error' })
          );
        } else {
          const status = err.response.status;
          dialogMessage = ERROR_MESSAGE[status as keyof typeof ERROR_MESSAGE];
          if (!dialogMessage) {
            dialogMessage = `エラーが発生しました。\nHTTP ステータス ${status}`;
          }
        }
        dispatch(setUnauthorized());
      } else if (err.response.status === 404) {
        // SA142 SA132 intEdit call SC973 not show error #117718
        if (notShowNotFoundError) {
          return {
            error: {
              status: err.response?.status,
              data: errorMessage,
            },
          };
        }
        // case: display prefix and code
        if (notFoundCode && data[notFoundCode]) {
          dialogMessage = `${ERROR_MESSAGE[404]} (${suffix}:${data[notFoundCode]})`;
        } else {
          // case default
          dialogMessage = ERROR_MESSAGE[404];
        }
      } else {
        const status = err.response.status;
        dialogMessage = ERROR_MESSAGE[status as keyof typeof ERROR_MESSAGE];
        if (!dialogMessage) {
          dialogMessage = `エラーが発生しました。\nHTTP ステータス ${status}`;
        }
      }
      //Handle show dialog error after show dialog detail
      if (data && 'isOpenInDialog' in data) {
        const key = 'isOpenInDialog' as keyof typeof data;
        if (data[key]) {
          if (dialogMessage) {
            dispatch(addError(dialogMessage));
            return {
              error: {
                status: err.response?.status,
                data: dialogMessage,
              },
            };
          }
          return {
            error: {
              status: err.response?.status,
              data: errorMessage,
            },
          };
        }
      }
      if (dialogMessage) {
        confirmDialog({
          type: 'error',
          title: 'エラー',
          message: dialogMessage,
          onConfirm: () => {},
        });
      }
      return {
        error: {
          status: err.response?.status,
          data: errorMessage,
        },
      };
    }
  };

const baseApi = createApi({
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0.0001,
  reducerPath: 'baseApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/' }),
  endpoints: () => ({}),
});

export default baseApi;
