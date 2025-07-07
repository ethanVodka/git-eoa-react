import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
    persistStore,
} from "redux-persist";
import {
    createStateSyncMiddleware,
    initMessageListener,
} from "redux-state-sync";

// 共通
import splitApi from "apis/axiosBaseQuery";
import dialogErrorSlice from "components/dialogError/dialogErrorSlice";
import fullScreenSnipingReducer from "components/fullScreenSniping/fullScreenSnipingSlice";
import pageMessageAreaReducer from "components/messageArea/PageMessageArea/PageMessageAreaSlice";
import snackbarReducer from "components/snackbars/SnackbarSlice";
import authReducer from "pages/auth/authSlice";
import commonParamsSlice from "pages/auth/commonParamsSlice";
import headerReducer from "components/layouts/headers/HeaderSlice";
import focusSlice from "./focusSlice";
import listenerMiddleware from "./listenerMiddleware";

export const store = configureStore({
    reducer: {
        [splitApi.reducerPath]: splitApi.reducer,
        auth: authReducer,
        commonParams: commonParamsSlice,
        fullScreenSniping: fullScreenSnipingReducer,
        snackbar: snackbarReducer,
        pageMessageArea: pageMessageAreaReducer,
        header: headerReducer,
        focus: focusSlice,
    },
    //GetDefaultMiddle
    middleware: (gDM) =>
        gDM({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        })
            .prepend(listenerMiddleware.middleware)
            .concat([
                splitApi.middleware,
                createStateSyncMiddleware({
                    whitelist: [
                        "auth/setToken",
                        "auth/setUnauthorized",
                        "auth/setUserDetail",
                        "auth/logout",
                        "auth/logoutSuccess",
                        "auth/setContext",
                    ],
                }),
            ]),
    devTools: process.env.NODE_ENV !== "production",
});

initMessageListener(store);

export const persister = persistStore(store);

// Optional, if use refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred dispatch type: Dispatch & ThunkDispatch<RootState, undefined, AnyAction>
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
