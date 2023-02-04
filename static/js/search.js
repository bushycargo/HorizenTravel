import axios from "axios";

let API = "/api/v1/search";
let data;

axios.get(API)
    .then(response => {
        data = response;
    })
    .catch(error => {console.error(error)});

let json = JSON.parse(data);
console.log(json);