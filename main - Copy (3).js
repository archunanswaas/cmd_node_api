var http = require("http");
var express = require('express');
var cors = require('cors');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'cmd_x360'
  });
  
  
  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  })


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
      extended:true
  }));
  app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	next();
 });

  var server = app.listen(3000, "127.0.0.1", function () {

    var host = server.address().address
    var port = server.address().port
  
    console.log("Example app listening at http://%s:%s", host, port)
  
  });


  //rest api to get all results
app.get('/accounts', function (req, res) {
    connection.query('select id,name from tp_companies', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
 });

app.get('/specialty', function (req, res) {
    connection.query('select id,name from tp_specialities', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });

 });


app.get('/states', function (req, res) {
    connection.query('select id,name from tp_states', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
    
 });
  
 //rest api to get a single employee data
 app.get('/campaigns/:acc_id', function (req, res) {
    //console.log(req.params.acc_id);
    connection.query('SELECT t1.id,t1.name from tp_campaigns t1 INNER JOIN tp_campaign_companies t2 on t1.id=t2.tp_campaign_id WHERE t2.tp_company_id = ? ', [req.params.acc_id], function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  }); 
 });
  
 //rest api to create a new record into mysql database
 app.post('/employees/:id', function (req, res) {
    var postData  = req.body;
    connection.query('INSERT INTO employee SET ?', postData, function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
 });
  
 //rest api to update record into mysql database
 app.put('/employees', function (req, res) {
 	console.log(req);
    connection.query('UPDATE `employee` SET `firstName`=?,`lastName`=?,`email`=? where `id`=?', [req.body.firstName,req.body.lastName, req.body.email, req.body.id], function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
 });    
  
 //rest api to delete record from mysql database
 app.delete('/employees/:id', function (req, res) {
    console.log(req.params.id);
    connection.query('DELETE FROM `employee` WHERE `id`=?', [req.params.id], function (error, results, fields) {
    if (error) throw error; 
     console.log("Deleted rows -->" + results.affectedRows);	
     //res.end("Record has been deleted"); 
    }); 

 });


 //rest api to get a single Total HCP
 app.get('/totalhcp/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT count(*) as tot_hcp FROM x360_tp_hcp_details where campaign_id = ?', [req.params.campaign_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });

    }else{
      connection.query('SELECT count(*) as tot_hcp FROM x360_tp_hcp_details', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});


app.get('/totalemailsent/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){

      connection.query('SELECT count(tot_email_sent) as tot_sent FROM x360_tp_hcp_details where campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT count(tot_email_sent) as tot_sent FROM x360_tp_hcp_details', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});



app.get('/totalemailopen/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT count(tot_email_open) as tot_open FROM x360_tp_hcp_details where campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT count(tot_email_open) as tot_open FROM x360_tp_hcp_details', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});



app.get('/totalemailclick/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT count(tot_email_click) as tot_click FROM x360_tp_hcp_details where campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT count(tot_email_click) as tot_click FROM x360_tp_hcp_details', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});
 


app.get('/totalassetclick/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT count(id) as tot_engage FROM engagements_main where source_x = "Email" and campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT count(id) as tot_engage FROM engagements_main where source_x = "Email"', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});



app.post('/hcplist', function (req, res) {
    //console.log(req.params.acc_id);
    //console.log(req.body.param.account_id);
    var select_field = '';
    var group_by = '';
    var where = '';

    if( Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length > 1 ){
    	
    select_field = 'SELECT t1.contact_id,t2.first_name,t2.last_name,t2.email,sp.name as specialty,st.name as location,SUM(t1.total_email_sent) as total_email_sent,SUM(t1.total_email_click) as total_email_click,SUM(t1.total_email_open) total_email_open,SUM(t1.total_email_engage) as total_email_engage'; 

    where = 'AND t1.campaign_id IN( '+ req.body.param.campaign_id +' )';
	group_by = 'GROUP BY t1.campaign_id';

    	/*'FROM `x360_hcp_global` t1 JOIN x360_contact_master t2 on t1.contact_id = t2.contact_id INNER JOIN tp_specialities as sp ON sp.id = t2.tp_speciality_id INNER JOIN tp_states st ON st.id = t2.tp_state_id and t1.contact_id != 0';	

    'SELECT t1.contact_id,t2.first_name,t2.last_name,t2.email,sp.name as specialty,st.name as location,t1.total_email_sent,t1.total_email_click,t1.total_email_open,t1.total_email_engage FROM `x360_hcp_global` t1 JOIN x360_contact_master t2 on t1.contact_id = t2.contact_id INNER JOIN tp_specialities as sp ON sp.id = t2.tp_speciality_id INNER JOIN tp_states st ON st.id = t2.tp_state_id and t1.contact_id != 0';*/
    
    }else if(Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length == 1){

    	select_field = 'SELECT t1.contact_id,t2.first_name,t2.last_name,t2.email,sp.name as specialty,st.name as location,t1.total_email_sent,t1.total_email_click,t1.total_email_open,t1.total_email_engage';
    	
    	where = where + 'AND campaign_id = '+ req.body.param.campaign_id;

	}else{

		select_field = 'SELECT t1.contact_id,t2.first_name,t2.last_name,t2.email,sp.name as specialty,st.name as location,t1.total_email_sent,t1.total_email_click,t1.total_email_open,t1.total_email_engage';
	}
   	
	if ( req.body.param.first_name !='' ){

		where = where + " AND t2.first_name LIKE '%" + req.body.param.first_name + "%'";	
	}

	if( req.body.param.last_name !='' ){

		where = where + " AND t2.last_name LIKE '%" + req.body.param.last_name + "%'";

	}


	if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 1 ){

		where = where + " AND t2.tp_speciality_id  IN (" + req.body.param.tp_specialty_id + ")";

	}else if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 0 ){

		where = where + " AND t2.tp_speciality_id = " + req.body.param.tp_specialty_id;
	}

	if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 1 ){

		where = where + " AND t2.tp_state_id  IN (" + req.body.param.tp_state_id + ")";

	}else if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 0 ){

		where = where + " AND t2.tp_state_id  =" + req.body.param.tp_state_id;	
	
	}
	
	var from_query = 'FROM `x360_hcp_global` t1 LEFT JOIN x360_contact_master t2 on t1.contact_id = t2.contact_id LEFT JOIN tp_specialities as sp ON sp.id = t2.tp_speciality_id LEFT JOIN tp_states st ON st.id = t2.tp_state_id WHERE t1.contact_id != 0';

	var Build_Query =  select_field + ' ' + from_query + ' ' + where + ' ' + group_by;

	console.log( Build_Query );
	console.log( '=============================================================================>' );
    //if(req.params.acc_id != 0 && req.params.campaign_id != 0 && req.params.filter_id != 0 ){
       
	 /*  switch(req.params.filter_id){
          case "1":
          extra_query = 'WHERE campaign_id = ' + req.params.campaign_id + ' ORDER BY tot_email_open DESC LIMIT 100';
          break;

          case "2":
          extra_query = 'WHERE campaign_id = ' + req.params.campaign_id + ' ORDER BY tot_engagement DESC LIMIT 100'; 
          break;

          case "3":
          extra_query = 'WHERE campaign_id = ' + req.params.campaign_id + ' ORDER BY tot_email_click DESC LIMIT 100'; 
          break;

          default:
          extra_query = 'LIMIT 100';
          break;

		}

		//sql = 'SELECT t1.cmd_id,t2.first_name,t2.last_name,t2.email,t2.tp_speciality_id,t1.tot_email_sent,t1.tot_email_click,t1.tot_email_open,t1.tot_engagement  FROM `x360_tp_hcp_details` t1 JOIN tp_hcp t2 on t1.cmd_id = t2.npi and  t1.cmd_id != 0 ' + extra_query;
	    sql = 'SELECT t1.cmd_id,t2.first_name,t2.last_name,t2.email,t2.tp_speciality_id,t1.tot_email_sent,t1.tot_email_click,t1.tot_email_open,t1.tot_engagement  FROM `x360_tp_hcp_details` t1 JOIN tp_hcp t2 on t1.cmd_id = t2.npi and  t1.cmd_id != 0 ' + extra_query;


		connection.query(sql,[req.params.campaign_id] , function (error, results, fields) {
       		if (error) throw error;
       		res.end(JSON.stringify(results));
        	console.log(extra_query);

    	}); */



    /*if(req.params.acc_id != 0 && req.params.campaign_id != 0 && req.params.filter_id != 0 ){
      connection.query('SELECT count(id) as tot_engage FROM engagements_main where source_x = "Email" and campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT DISTINCT(t1.cmd_id) as cmd_id,t2.first_name,t2.last_name,t2.email,t2.tp_speciality_id FROM `x360_tp_hcp_details` t1 JOIN tp_hcp t2 on t1.cmd_id = t2.npi and  t1.cmd_id != 0 ' + extra_query , function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }*/
    
});
