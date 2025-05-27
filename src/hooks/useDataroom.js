// useDataroom.js
import { useContext } from "react";
import DataroomContext from "../contexts/DataroomContext";

const useDataroom = () => useContext(DataroomContext);

export default useDataroom;
