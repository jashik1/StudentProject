import axios from "axios";
const PROJECT_NUMBER = import.meta.env.VITE_PROJECT_NUMBER;

const url = `https://api-${PROJECT_NUMBER}.europe-west3.run.app`;

const buildGetPath = (
  endpoint: string,
  parameters: { [key: string]: string } = {},
) => {
  let path = `${url}/${endpoint}?`;
  for (const [key, value] of Object.entries(parameters)) {
    path += `${key}=${value}&`;
  }
  return path;
};

const apiGet = async (
  endpoint: string,
  parameters: { [key: string]: string } = {},
) => {
  const path = buildGetPath(endpoint, parameters);
  try {
    const response = await axios.get(path, {
      headers: {
        Accept: "application/json",
      },
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error message: ", error.message);
    } else {
      console.error("Unexpected error: ", error);
    }
    return [];
  }
};

export const getTestData = () => {
  return apiGet("test-data", {});
};
