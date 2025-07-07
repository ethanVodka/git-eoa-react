import React, { useEffect, useState, useContext, useRef } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useNavigate } from 'react-router-dom';
import { PageRoute } from 'constants/routeConstants';
import { confirmDialog } from 'services/dialogService';
import { GlobalComponentsContext } from 'contexts/globalComponentsContext';
import { saveAs } from 'file-saver';

const apiClient = axios.create({
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

export const ApiClientProvider = ({ children }: { children: React.ReactElement }) => {
  const navigate = useNavigate();
  const { setShowSnackbar, setSnackbarMessage, setSnackbarSeverity, setOpenLoading } =
    useContext(GlobalComponentsContext);

  // 一度インターセプターを設定したら再設定しないようにするためStatus管理
  const [isSet, setIsSet] = useState(false);
  // 開発時のstrict modeによるuseEffectの2回実行防止用
  const firstRef = useRef(true);
  // ContextにアクセスするためuseEffect内でintercepterを設定
  useEffect(() => {
    // strict mode対策
    if (process.env.NODE_ENV === 'development') {
      if (firstRef.current) {
        firstRef.current = false;
        return;
      }
    }
    if (isSet) return;

    console.log('useEffect：apiClient');
    // リクエスト時共通処理
    apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
      if (config.loading) {
        // ローディングを開く
        setOpenLoading(true);
      }
      if (config.setErrorMessage) {
        // エラーメッセージを空にする
        config.setErrorMessage([]);
      }
      return config;
    });

    // レスポンス時共通処理
    const commonResponseAction = (config: AxiosRequestConfig) => {
      if (config.loading) {
        // ローディングを閉じる（レスポンスが早いと一瞬だけ見えて気持ち悪いので最低0.2秒は表示している）
        setTimeout(() => setOpenLoading(false), 200);
      }
    };
    apiClient.interceptors.response.use(
      response => {
        const config: AxiosRequestConfig = response.config;
        commonResponseAction(config);

        // 成功時に表示するメッセージが設定されている場合、SnackBarで表示する
        let successMessage = '';
        switch (config.successMessageType) {
          case 'registered':
            successMessage = '登録されました。';
            break;
          case 'check':
            successMessage = '処理結果をホーム画面で確認してください。';
            break;
          case 'updated':
            successMessage = '更新されました。';
            break;
          case 'deleted':
            successMessage = '削除されました。';
            break;
        }
        if (successMessage) {
          setSnackbarSeverity('success');
          setSnackbarMessage(successMessage);
          setShowSnackbar(true);
        }
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
          }
        }
        return response;
      },
      error => {
        const config: AxiosRequestConfig = error.config;
        commonResponseAction(config);

        let dialogMessage = '';
        if (error.code === 'ECONNABORTED') {
          dialogMessage = `接続が中断されました。`;
        } else if (!error.response) {
          dialogMessage = `通信エラーが発生しました。\nインターネットに接続されていないか\nサーバがダウンしている可能性があります。`;
        } else {
          const status = error.response.status;

          if (config.selfErrorHandlingStatus?.includes(status)) {
            // 自分自身でエラーハンドリングを行う対象のステータスだった場合は何もしない
            return Promise.reject(error);
          }
          switch (status) {
            case 400: // Bad Request
              if (config.setErrorMessage && error.response.data.messages) {
                // メッセージエリアにメッセージを表示する
                config.setErrorMessage(() => {
                  const errorList = [];
                  for (let i in error.response.data.messages) {
                    errorList.push(error.response.data.messages[i].message);
                  }
                  return errorList;
                });
                setSnackbarSeverity('error');
                setSnackbarMessage('エラーメッセージがあります。');
                setShowSnackbar(true);
              } else {
                dialogMessage = `要求内容に誤りがあります。`;
              }
              break;
            case 401: // Unauthorized
              dialogMessage = `セッションがタイムアウトしました。\n再度ログインしてください。`;
              // ログイン画面に戻る
              navigate(PageRoute.Login);
              break;
            case 403: // Forbidden
              dialogMessage = `権限がありません。`;
              break;
            case 404: // Not Found
              dialogMessage = `対象データがありません。`;
              break;
            case 408: // Request Timeout
              dialogMessage = `要求がタイムアウトしました。`;
              break;
            case 409: // Conflict
              dialogMessage = `他のユーザにデータが更新されています。\n画面を再表示してください。`;
              break;
            case 413: // Payload Too Large
              dialogMessage = `リクエストサイズが大きすぎます。\nファイルアップロードは1ファイル最大200MBです。`;
              break;
            case 429: // Too Many Requests
              dialogMessage = `多くの人がシステムを利用しているため\nリクエストが制限されました。`;
              break;
            case 500: // Internal Server Error
              dialogMessage = `システムエラーが発生しました。\nシステム管理者にお問い合わせください。`;
              break;
            case 502: // Bad Gateway
              dialogMessage = `ゲートウェイに問題が発生しています。`;
              break;
            case 503: // Service Unavailable
              dialogMessage = `メンテナンス中です。\n現在システムは利用できません。`;
              break;
            case 504: // Gateway Timeout
              dialogMessage = `応答がタイムアウトしました。`;
              break;
            default:
              dialogMessage = `エラーが発生しました。\nHTTP ステータス ${status}`;
              break;
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
        return Promise.reject(error);
      }
    );
    setIsSet(true);
  }, [navigate, setShowSnackbar, setSnackbarMessage, setSnackbarSeverity, setOpenLoading, isSet]);
  // 子コンポーネントはインターセプター設定後にレンダリングさせたい
  return <>{isSet && children}</>;
};
export default apiClient;
