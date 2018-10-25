var http = require("http");
var express = require('express');
var cors = require('cors');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host     : '127.0.0.1',
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
    connection.query('SELECT id,name FROM tp_companies ORDER BY name ASC', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
 });

app.post('/specialty', function (req, res) {
	//console.log(req.body.campaign_array);
	var sql = '';
	if(Array.isArray(req.body.campaign_array) && req.body.campaign_array.length > 0 ){

		
		sql = 'SELECT DISTINCT(t3.id) as id,t3.name FROM hcp_campaign_mapper t1 INNER JOIN cmd_global_campaign_hcp_master t2 ON t1.id = t2.mapper_id INNER JOIN global_specialty_master as t3 ON t2.tp_speciality_id = t3.id WHERE t1.campaign_id IN (' + req.body.campaign_array +' ) and t2.hcp_global_id != 1';
	
	}else{
		
		sql = 'SELECT DISTINCT(id) as id,name FROM global_specialty_master ';
	}

	//console.log(sql);
    connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify(results));
  	//console.log(JSON.stringify(results)); 
  	});

 });


app.post('/zipcode', function (req, res) {
	//console.log(req.body.campaign_array);
	var sql = '';
	if(Array.isArray(req.body.campaign_array) && req.body.campaign_array.length > 0 ){

		
		sql = 'SELECT DISTINCT(t1.zipcode) as zipcode FROM cmd_global_campaign_hcp_master t1 INNER JOIN hcp_campaign_mapper t2 ON t1.contact_id = t2.contact_id WHERE t2.campaign_id IN (' + req.body.campaign_array +' )';
	
	}else{
		
		sql = 'SELECT DISTINCT(zipcode) as zipcode FROM cmd_global_campaign_hcp_master';
	}

	//console.log(sql);
    connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify(results));
  	
  	});

 });
	

app.post('/states', function (req, res) {
   
	//console.log(req.body.campaign_array);
	var sql = '';
	if(Array.isArray(req.body.campaign_array) && req.body.campaign_array.length > 0 ){

		
		sql = 'SELECT t3.id,t3.name FROM x360_hcp_global t1 INNER JOIN hcp_global_contact_master t2 ON t1.hcp_global_id = t2.hcp_global_id INNER JOIN global_state_master as t3 ON t2.tp_state_id = t3.id WHERE t1.campaign_id IN (' + req.body.campaign_array + ' ) GROUP BY t3.id ORDER BY t3.name ASC';
	
	}else{
		
		sql = 'SELECT DISTINCT(id) as id,name FROM global_state_master';
	}
 
	//console.log(sql);
    connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify(results));
  	
  	});


    
 });
  
 //rest api to get a single employee data
 // app.get('/campaigns', function (req, res) {
 //    //console.log(req.params.acc_id);
 //    connection.query('SELECT t1.id,t1.name from x360_campaign t1 INNER JOIN tp_campaign_companies t2 on t1.id=t2.tp_campaign_id WHERE t2.tp_company_id = ? ', [req.params.acc_id], function (error, results, fields) { 
 //    if (error) throw error;
 //    res.end(JSON.stringify(results));
 //    console.log(JSON.stringify(results));
 //  }); 
 // });

app.get('/campaigns', function (req, res) {
    //console.log(req.params.acc_id);
    connection.query('SELECT campaign_id as id,campaign_name as name from x360_campaign',function (error, results, fields) { 
    if (error) throw error;
    res.end(JSON.stringify(results));
  		//console.log(JSON.stringify(results));
    });
});	  

app.get('/ownership', function (req, res) {
    //console.log(req.params.acc_id);
    connection.query('SELECT id,name from x360_ownership',function (error, results, fields) { 
    if (error) throw error;
    res.end(JSON.stringify(results));
  		//console.log(JSON.stringify(results));
    });
});
 
 //rest api to get a single Total HCP
 app.get('/totalhcp/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT count(hcp_global_id) as tot_hcp FROM x360_hcp_global WHERE hcp_global_id !=0 AND campaign_id = ?', [req.params.campaign_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });

    }else{
      connection.query('SELECT count(hcp_global_id) as tot_hcp FROM x360_hcp_global', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});


app.get('/totalemailsent/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){

      connection.query('SELECT SUM(total_email_sent) as tot_sent FROM x360_hcp_global WHERE hcp_global_id != 0 AND campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT SUM(total_email_sent) as tot_sent FROM x360_hcp_global WHERE hcp_global_id != 0', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});



app.get('/totalemailopen/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT SUM(total_email_open) as tot_open FROM x360_hcp_global WHERE hcp_global_id != 0 AND campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT SUM(total_email_open) as tot_open FROM x360_hcp_global WHERE hcp_global_id != 0', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});



app.get('/totalemailclick/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT SUM(total_email_click) as tot_engage FROM x360_hcp_global WHERE hcp_global_id != 0 AND campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT SUM(total_email_click) as tot_engage FROM x360_hcp_global WHERE hcp_global_id != 0', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }

});
 

app.get('/totalassetclick/:acc_id/:campaign_id', function (req, res) {
    //console.log(req.params.acc_id);
    if(req.params.acc_id != 0 && req.params.campaign_id != 0  ){
      connection.query('SELECT SUM(total_email_engage) as tot_inter FROM x360_hcp_global where hcp_global_id != 0 AND campaign_id = ?', [req.params.campaign_id,req.params.acc_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results)); 
    });

    }else{
      connection.query('SELECT SUM(total_email_engage) as tot_inter FROM x360_hcp_global WHERE hcp_global_id != 0', function (error, results, fields) {
        
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
    var limit = 'limit 10000';


    if( Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length > 1 && req.body.param.campaign_id != 0 && req.body.param.campaign_id != '' ){
    	
    	select_field = 'SELECT  t1.hcp_global_id,t1.npi,t3.campaign_id,t4.name as campaign_name,t1.first_name,t1.last_name,t1.email,sp.name as specialty,st.name as state,t1.zipcode,t3.total_email_sent as total_email_sent,t3.total_email_click as total_email_click,t3.total_email_open total_email_open,t3.total_email_engage as total_email_engage,(CASE WHEN t1.network_type = 1 THEN "IN" ELSE "OUT" END) as network_type,DATE_FORMAT(t1.License_start_Date,"%m-%d-%Y") as start_date,DATE_FORMAT(t1.License_end_Date,"%m-%d-%Y") as end_date';  

    	where = 'AND t3.campaign_id IN( '+ req.body.param.campaign_id +' ) AND t2.campaign_id IN( '+ req.body.param.campaign_id +' )';
		//group_by = 'GROUP BY t1.campaign_id';
		group_by = '';
		limit = '';
	
	}else if(Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length == 1 && req.body.param.campaign_id != 0 && req.body.param.campaign_id != ''){

    	select_field = 'SELECT  t1.hcp_global_id,t1.npi,t3.campaign_id,t4.name as campaign_name,t1.first_name,t1.last_name,t1.email,sp.name as specialty,st.name as state,t1.zipcode,t3.total_email_sent as total_email_sent,t3.total_email_click as total_email_click,t3.total_email_open total_email_open,t3.total_email_engage as total_email_engage,(CASE WHEN t1.network_type = 1 THEN "IN" ELSE "OUT" END) as network_type,DATE_FORMAT(t1.License_start_Date,"%m-%d-%Y") as start_date,DATE_FORMAT(t1.License_end_Date,"%m-%d-%Y") as end_date';
    	
    	where = where + 'AND t3.campaign_id = '+ req.body.param.campaign_id +' AND t2.campaign_id = ' + req.body.param.campaign_id ;
    	limit = '';

	}else{

		select_field = 'SELECT  t1.hcp_global_id,t1.npi,t3.campaign_id,t4.name as campaign_name,t1.first_name,t1.last_name,t1.email,sp.name as specialty,st.name as state,t1.zipcode,t3.total_email_sent as total_email_sent,t3.total_email_click as total_email_click,t3.total_email_open total_email_open,t3.total_email_engage as total_email_engage,(CASE WHEN t1.network_type = 1 THEN "IN" ELSE "OUT" END) as network_type,DATE_FORMAT(t1.License_start_Date,"%m-%d-%Y") as start_date,DATE_FORMAT(t1.License_end_Date,"%m-%d-%Y") as end_date';
	}
   	
	if ( req.body.param.first_name !='' && req.body.param != 0 ){

		where = where + " AND t1.first_name LIKE '%" + req.body.param.first_name + "%'";
		//limit = "limit 1";	
	}

	if( req.body.param.last_name !='' && req.body.param != 0 ){

		where = where + " AND t1.last_name LIKE '%" + req.body.param.last_name + "%'";
		
	}

	
	if( req.body.param.first_name !='' && req.body.param.last_name =='' && req.body.param.campaign_id == 0 && req.body.param != 0 && req.body.param.npi =='' &&  req.body.param.hcp_email =='' && req.body.param.tp_specialty_id == '' && req.body.param.tp_state_id == '' && req.body.param.network_type == '' && req.body.moredata === false ){

		limit = "limit 1";
	}	

	if( req.body.param.last_name !='' && req.body.param.first_name == '' && req.body.param.campaign_id == 0 && req.body.param != 0 && req.body.param.npi =='' &&  req.body.param.hcp_email =='' && req.body.param.tp_specialty_id == '' && req.body.param.tp_state_id == '' && req.body.param.network_type == '' && req.body.moredata === false ){

		limit = "limit 1";
	}

	if( req.body.param.npi !='' && req.body.param != 0 ){

		where = where + " AND t1.npi = " + req.body.param.npi;

	}

	if( req.body.param.hcp_email !='' && req.body.param != 0 ){

		where = where + " AND t1.email LIKE '%" + req.body.param.hcp_email + "%'";
	}

	if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 1 ){

		where = where + " AND t1.tp_speciality_id  IN (" + req.body.param.tp_specialty_id + ")";

	}else if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 0 ){

		where = where + " AND t1.tp_speciality_id = " + req.body.param.tp_specialty_id;
	}

	if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 1 ){

		where = where + " AND t1.tp_state_id  IN (" + req.body.param.tp_state_id + ")";

	}else if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 0 ){

		where = where + " AND t1.tp_state_id  =" + req.body.param.tp_state_id;	
	
	}


	if( req.body.param.network_type !=''  && req.body.param.network_type == 1 && req.body.param != 0 ){

		where = where + " AND t1.network_type = 1" ;

	}else if( req.body.param.network_type !=''  && req.body.param.network_type == 0 && req.body.param != 0 ){

		where = where + " AND t1.network_type = 0" ;
	} 
	
	var from_query = 'FROM `cmd_global_campaign_hcp_master` t1 LEFT JOIN hcp_campaign_mapper t2 on t1.mapper_id = t2.id LEFT JOIN x360_hcp_global t3 on  t1.hcp_global_id = t3.hcp_global_id LEFT JOIN tp_campaigns t4 on t2.campaign_id = t4.id LEFT JOIN global_specialty_master  as sp ON sp.id = t1.tp_speciality_id LEFT JOIN global_state_master st ON st.id = t1.tp_state_id WHERE t3.hcp_global_id != 1';
	

	var Build_Query =  select_field + ' ' + from_query + ' ' + where + ' ' + group_by +  limit;
	console.log(Build_Query);
	connection.query(Build_Query, function (error, results, fields) {
      if (error) throw error;
      //res.end(JSON.stringify(results));
      res.end(JSON.stringify(results));
      //console.log(JSON.stringify(results));
    }); 
	
    
});


