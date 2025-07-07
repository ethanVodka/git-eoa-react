import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
    setOpenDialogDetail,
    closeDialogDetail,
} from "components/dialogError/dialogErrorSlice";
import { ActionCreators } from "redux-undo";
import { RootState } from "./store";
import { diffCurrentCommonParams } from "utils/helpers";

const listenerMiddleware = createListenerMiddleware();

const isOpenDialog = (actionType: string) => {
    const subFixList = [
        "setItem",
        "init",
        "setIsCreateNew", //sa222
        "setInit", //sa132
        "setGetEdit",
        "setGetCopy", //pu132
        "setContentValues", //pu212
        "setOpenDialog", //pu212
        "setItemsSelected", //pu212
    ];
    const hasItem = subFixList.find((i) => actionType.includes(i));
    return !!hasItem;
};

//Listening when open dialog detail
listenerMiddleware.startListening({
    predicate: (action, currentState) => {
        // return true when the listener should run
        if (typeof action.type == "string" && isOpenDialog(action.type)) {
            const actionType = action.type.split("/");
            const sliceName = actionType[0];
            if (
                sliceName &&
                currentState &&
                typeof sliceName === "string" &&
                typeof currentState === "object" &&
                sliceName in currentState
            ) {
                const key = sliceName as keyof typeof currentState;
                const state = currentState?.[key];
                if (typeof state === "object" && "open" in state) {
                    const keyOpen = "open" as keyof typeof state;
                    return state?.[keyOpen];
                }
            }
        }
        return false;
    },
    effect: (_, store) => {
        store.dispatch(setOpenDialogDetail(true));
    },
});

const isCloseDialog = (actionType: string) => {
    const subFixList = ["onClose"];
    const hasItem = subFixList.find((i) => actionType.includes(i));
    return !!hasItem;
};

//Listening when close dialog detail
listenerMiddleware.startListening({
    predicate: (action, currentState) => {
        // return true when the listener should run
        if (typeof action.type == "string" && isCloseDialog(action.type)) {
            const actionType = action.type.split("/");
            const sliceName = actionType[0];
            if (
                sliceName &&
                currentState &&
                typeof sliceName === "string" &&
                typeof currentState === "object" &&
                sliceName in currentState
            ) {
                const key = sliceName as keyof typeof currentState;
                const state = currentState?.[key];
                if (typeof state === "object" && "open" in state) {
                    const keyOpen = "open" as keyof typeof state;
                    return state?.[keyOpen] === false;
                }
            }
        }
        return false;
    },
    effect: (_, store) => {
        store.dispatch(closeDialogDetail());
        //Back common params
        const { auth, commonParams } = store.getState() as RootState;
        const listViewCommonParams = auth.listViewCommonParams;
        const commonParamsPresent = commonParams.present.commonParams;
        if (
            diffCurrentCommonParams(listViewCommonParams, commonParamsPresent)
        ) {
            store.dispatch(ActionCreators.undo());
        }
    },
});

export default listenerMiddleware;
