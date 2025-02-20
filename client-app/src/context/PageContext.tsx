import React, { useState, ReactNode } from "react";
import { Page } from "../enums/PageEnum";

interface PageContextType {
    page: Page;
    setPage: (newPage: Page) => void;
}

export const PageContext = React.createContext<PageContextType>({
    page: Page.MAIN_PAGE,
    setPage: () => {}
});

interface PageProviderProps {
    children: ReactNode;
}

const PageProvider: React.FC<PageProviderProps> = ({ children }) => {

    const [page, setPage] = useState<Page>(Page.MAIN_PAGE);

    return (
        <PageContext.Provider value={{ page, setPage }}>
            { children }
        </PageContext.Provider>
    )
}

export default PageProvider