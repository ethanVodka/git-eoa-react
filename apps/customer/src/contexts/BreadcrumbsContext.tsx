import { FC, createContext, useRef, MutableRefObject } from "react";
import { BreadcrumbData } from "use-react-router-breadcrumbs";

type BreadcrumbsContextType = {
    breadcrumbsList: MutableRefObject<BreadcrumbData<string>[]>;
};
type SetBreadcrumbsContextType = {
    setBreadcrumbsList: (bl: BreadcrumbData<string>[]) => void;
};

export const BreadcrumbsContext = createContext<BreadcrumbsContextType>(
    {} as BreadcrumbsContextType
);
export const SetBreadcrumbsContext = createContext<SetBreadcrumbsContextType>(
    {} as SetBreadcrumbsContextType
);

export const BreadcrumbsProvider: FC = (props) => {
    // Refで管理
    const breadcrumbsList = useRef<BreadcrumbData<string>[]>([]);
    const { children } = props;
    // Providerに渡すvalue値を設定
    const setBreadcrumbsList = (bl: BreadcrumbData<string>[]) => {
        breadcrumbsList.current = bl;
    };
    const value: BreadcrumbsContextType = {
        breadcrumbsList,
    };
    const setValue: SetBreadcrumbsContextType = {
        setBreadcrumbsList,
    };
    // valueを設定したContext.Providerを返却する
    return (
        <BreadcrumbsContext.Provider value={value}>
            <SetBreadcrumbsContext.Provider value={setValue}>
                {children}
            </SetBreadcrumbsContext.Provider>
        </BreadcrumbsContext.Provider>
    );
};
