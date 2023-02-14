import axios from "axios";
import { apiInstance } from "../../api";
const api = apiInstance();
// let baseUrl="http://localhost:8080/api/v1/points";
let baseUrl="http://i8a508.p.ssafy.io:8083/api/v1/points";

function getPoints(){
    return async (dispatch)=>{
        let url = baseUrl;
        let response = await api.get(url)
        .then((response)=>{
            let data=response.data;
            dispatch({type:"GET_POINT_LIST_SUCCESS",payload:{data}});
            console.log(data);
        })
        .catch((error)=>{
            console.log("GETPOINT ERROR", error);
        })
    }   
}

function updatePoints(trade_id){
    const inputs = {
        tradeId:trade_id,
        process: 1
    }
    console.log(inputs);
    return async () => {
      let url = baseUrl+`/${trade_id}`;
      let response = await api.put(url, JSON.stringify(inputs), {headers: {
        "Content-Type": "application/json;charset=utf-8"}})
        .then((response) => {
          let data = response.data;
          console.log(data);
        })
        .catch((error) => {
          console.log("ERROR", error);
        });
    };
  }

function deletePoints(trade_id){
    return async ()=>{
        let url = baseUrl+`/${trade_id}`;
        let response = await api.delete(url)
        .then((response)=>{
            let data=response.data;
            console.log(data);
        })
        .catch((error)=>{
            console.log("deletePoints ERROR", error);
        })
    }   
}

export const adminAction = {getPoints, deletePoints, updatePoints};