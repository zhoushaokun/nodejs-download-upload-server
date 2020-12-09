const axios = require("axios");
function test() {
  // const url = "http://192.168.88.187:3000/async/t_address-mode.ttl";
  const url = "http://localhost:3001/async/t_address-mode.ttl";
  const fileUrl = "http://192.168.88.187:8407/publish/R2RML/t_address-model.ttl";
  const fileName = "t_address-model.ttl";
  return axios.post(url, {
      fileUrl,
      fileName, 
    }).catch(r => {
      console.log('r', r)
    })
}

test()