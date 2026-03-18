import { Provider } from "react-redux";

import { store } from "../store";

export const AppProviders = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
