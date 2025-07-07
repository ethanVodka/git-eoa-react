import React, { FC, createContext, useState } from "react";
import { AlertColor } from "@mui/material";
import SnackbarCommon from "components/snackbars/Snackbar";
import Loading from "components/loading/Loading";

type GlobalComponentsType = {
    // スナックバー
    showSnackbar: boolean;
    setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
    snackbarMessage: string;
    setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
    snackbarSeverity: AlertColor;
    setSnackbarSeverity: React.Dispatch<React.SetStateAction<AlertColor>>;
    // ローディング
    openLoading: boolean;
    setOpenLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GlobalComponentsContext = createContext<GlobalComponentsType>(
    {} as GlobalComponentsType
);

// Context.ProviderでChildrenを囲む
export const GlobalComponentsProvider: FC = (props) => {
    // State管理
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] =
        useState<AlertColor>("info");
    const [openLoading, setOpenLoading] = useState(false);
    // PropsからChildrenを取得
    const { children } = props;
    // Providerに渡すvalue値(State)を設定
    const value: GlobalComponentsType = {
        showSnackbar,
        setShowSnackbar,
        snackbarMessage,
        setSnackbarMessage,
        snackbarSeverity,
        setSnackbarSeverity,
        openLoading,
        setOpenLoading,
    };
    // valueを設定したContext.Providerを返却する
    return (
        <GlobalComponentsContext.Provider value={value}>
            <SnackbarCommon
                open={showSnackbar}
                message={snackbarMessage}
                severity={snackbarSeverity}
                setOpen={setShowSnackbar}
            />
            <Loading open={openLoading} />
            {children}
        </GlobalComponentsContext.Provider>
    );
};
