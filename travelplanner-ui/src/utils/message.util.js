import { endpoint } from "../constants";
import { callExternalApi } from "./external-api.util";

export const callPublicAPI = async (config, route="") => {
  const url = `${endpoint}${route}`;

  const { data, status } = await callExternalApi(url, config);

  return {
    data: data,
    status: status,
  };
};

export const callProtectedAPI = async (config, route="") => {  
  const url = `${endpoint}${route}`;
  const { data, status } = await callExternalApi(url, config);
  return {
    data: data,
    status: status,
  };
};
