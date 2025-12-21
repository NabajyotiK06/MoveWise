import { createContext, useState } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [searchedLocation, setSearchedLocation] = useState(null); // { lat, lng, displayName }

    return (
        <LocationContext.Provider value={{ searchedLocation, setSearchedLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
