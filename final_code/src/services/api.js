import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/event_backend/",
  withCredentials: true, 
});

export default API;
