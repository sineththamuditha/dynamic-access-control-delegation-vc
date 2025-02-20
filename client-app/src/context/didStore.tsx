import React, { ReactNode, useState } from "react";

interface DIDStoreType {
    dids: {[key: string] : string};
    addDID: (key: string, did: string) => void;
    hasDID: (key:string) => boolean
}

export const DIDStore = React.createContext<DIDStoreType>({
    dids: {},
    addDID: () => {},
    hasDID: () => false
});

interface DIDStoreProviderProps {
    children: ReactNode
}

const DIDStoreProvider : React.FC<DIDStoreProviderProps> =({children}) => {
    const [dids, setDIDs] = useState<{[key: string] :string}>({});

    const addDID = (key: string, did: string) => {
        setDIDs((prevDIDs) => ({
            ...prevDIDs,
            [key]: did
        }))
    }

    const hasDID: (key:string) => boolean = (key: string) => {
        if (dids[key] === undefined) {
            return false;
        }
        return true
    }

    return (
        <DIDStore.Provider value={{dids, addDID, hasDID}}>
            {children}
        </DIDStore.Provider>
    )
}

export default DIDStoreProvider;