var express = require('express');
var fs =  require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // fs.readdir(path, callback)
  var fileList;
  fs.readdir('./uploads', (err,files)=>{
    if(err) throw err;
    fileList = files
    console.log("Files");
    console.log(fileList);
    res.render('files', { title: 'Files', fileList: fileList });
  })

});

module.exports = router;
