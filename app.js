var http = require('http');
var express = require('express');
var multer  =   require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var files = require('./routes/files');

MongoClient = require('mongodb').MongoClient;
Server = require('mongodb').Server;
Database = require('./database/mongodb').Database;


var app = express();

// view engine setup
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);
app.use('/files', files);
//app.use('/db', db);

 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* File I/O */
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

// app.get('/photos',function(req,res){
//       res.sendFile(__dirname + "/uploadedPhotos.html");
// });

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file." + err);
        }
        res.redirect('/files');
        // res.end("File is uploaded");
        //
        // var img = fs.readFileSync('./logo.gif');
        // res.writeHead(200, {'Content-Type': 'image/gif' });
        // res.end(img, 'binary');
    });
});



/* Database */
var mongoHost = 'localhost'; //A
var mongoPort = 27017; 
var db;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
    var url = 'mongodb://localhost:27017/LynxReact';

    mongoClient.connect(url, function(err, dbconn) { //C
    if (!mongoClient) {
        console.error("Error! Exiting... Must start MongoDB first");
        process.exit(1); //D
    }
    db = new Database(dbconn);
});


app.get('/db/:collection', function(req, res) { //A
   var params = req.params; //B
   db.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
              }
         }
   	});
});
 
app.get('/db/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       db.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});


//Check / login
app.post('/ws/login/', function(req, res) { //A
    var object = req.body;
    db.login(object, function(err,user) {
          if (err) res.send(400, err);  
          else res.send(201, user); //B
     });
});

app.post('/db/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    db.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});


app.put('/db/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       db.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

app.delete('/db/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       db.delete(collection, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});

// error handlers


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// app.use(function (req,res) {
//    res.render('404', {url:req.url});
//});


// development error handler
 


// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
