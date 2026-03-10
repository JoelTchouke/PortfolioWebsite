import { createContext, useState } from 'react';

export const NavigationContext = createContext({
  comingFromHonors: false,
  setComingFromHonors: () => {},
});

export function NavigationProvider({ children }) {
  const [comingFromHonors, setComingFromHonors] = useState(false);
  return (
    <NavigationContext.Provider value={{ comingFromHonors, setComingFromHonors }}>
      {children}
    </NavigationContext.Provider>
  );
}
