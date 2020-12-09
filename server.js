const http = require('http');
const fs = require('fs');
const path = require('path');
const { getFileAndSave } = require('./api');

let port = process.argv[2] || 3000;
const httpServer = http.createServer(requestHandler);
httpServer.listen(port, () => {console.log('server is listening on port '+ port)});

function requestHandler(req, res){
  if(req.url === '/'){
    sendIndexHtml(res);
  }else if( req.url === '/list'){
    sendListOfUploadedFiles(res);
  }else if( /\/download\/[^\/]+$/.test(req.url)){
    sendUploadedFile(req, res);
  }else if( /\/upload\/[^\/]+$/.test(req.url) ){
    saveUploadedFile(req, res)
  }else if (/\/async\/[^\/]+$/.test(req.url)){
    saveFile(req, res);
  }else{
    sendInvalidRequest(res);
  }
}

// 添加监听
function saveFile(req, res) {
  let postData = '';
  req.addListener("data", function (postDataChunk) {
    postData += postDataChunk;
  });
  req.addListener("end", function () {
    console.log('数据接收完毕');
    const data = JSON.parse(postData);//GET & POST  解释表单数据部分{name="zzl",email="zzl@sina.com"}
    getFileAndSave(data.fileUrl, data.fileName).then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({
        status: 'success',
      }));
      console.log('success saved')
      res.end();
    }).catch(() => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({
        status: 'error',
      }));
      console.log('error!');
      res.end();
    })
  });
}


function sendIndexHtml(res){
  let indexFile = path.join(__dirname, 'index.html');
  fs.readFile(indexFile, (err, content) => {
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(content);
      res.end();
    }
  })
}

function sendListOfUploadedFiles(res){
  let uploadDir = path.join(__dirname, 'download');
  fs.readdir(uploadDir, (err, files) => {
    if(err){
      console.log(err);
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(err.message));
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(files));
      res.end();
    }
  })
}

// 下载文件
function sendUploadedFile(req, res){
  let file = path.join(__dirname, req.data.fileName);
  fs.readFile(file, (err, content) => {
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'application/octet-stream'});
      res.write(content);
      res.end();
    }
  })
}

function getFileName(url) {
  return url.slice(url.lastIndexOf("/"));
}

// 上传文件保存
function saveUploadedFile(req, res){
  console.log('saving uploaded file');
  let fileName = path.basename(getFileName(req.url));
  let file = path.join(__dirname, 'download', fileName)
  req.pipe(fs.createWriteStream(file));
  req.on('end', () => {
    res.writeHead(200, {'Content-Type': 'text'});
    res.write('uploaded succesfully');
    res.end();
  })
}

function sendInvalidRequest(res){
  res.writeHead(400, {'Content-Type': 'application/json'});
  res.write('Invalid Request');
  res.end(); 
}