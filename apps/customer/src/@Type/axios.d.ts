import "axios";

// axiosのAxiosRequestConfigを拡張する
declare module "axios" {
    export interface AxiosRequestConfig {
        // リクエストが正常に終了した時にSnackBarで表示するメッセージタイプ（未設定の場合は何も出さない）
        successMessageType?:
            | ""
            | "registered"
            | "check"
            | "updated"
            | "deleted";
        // 特定のHTTPステータスの場合に自分自身でエラーハンドリングを行いたい場合に対象のステータスを設定する
        selfErrorHandlingStatus?: Array<number>;
        // 入力値検証エラーでレスポンスされたメッセージを設定するsetterを指定する
        setErrorMessage?: React.Dispatch<React.SetStateAction<Array>>;
        // ローディングを表示するか
        loading?: boolean;
    }
}
