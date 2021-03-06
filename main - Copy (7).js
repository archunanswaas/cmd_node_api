var http = require("http");
var express = require('express');
var cors = require('cors');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer');
var router = express.Router();
var XLSX = require('xlsx');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");



var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'cmd_x360'
  });
  
  
  connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
  });


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



 //app.use(express.static(path.join(__dirname, 'uploads')));

  var server = app.listen(3000, "127.0.0.1", function () {

    var host = server.address().address
    var port = server.address().port
  
    console.log("Example app listening at http://%s:%s", host, port)
  
  });


/************************ CMD Dashboard and Search filters APIS STARTS HERE ***************************/

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
    var group_by = '';
    var where = '';
    var limit = 'limit 1';
    var HcpMasterFromQuery = '';


    if( Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length > 1 && req.body.param.campaign_id != 0 && req.body.param.campaign_id != '' ){
    	
    	 
		where = 'AND t3.campaign_id IN( '+ req.body.param.campaign_id +' ) AND t2.campaign_id IN( '+ req.body.param.campaign_id +' )';
		//group_by = 'GROUP BY t1.campaign_id';
		group_by = '';
		limit = '';
	
	}else if(Array.isArray(req.body.param.campaign_id) && req.body.param.campaign_id.length == 1 && req.body.param.campaign_id != 0 && req.body.param.campaign_id != ''){

    	where = where + 'AND t3.campaign_id = '+ req.body.param.campaign_id +' AND t2.campaign_id = ' + req.body.param.campaign_id ;
    	limit = '';

	}

   	
	if ( req.body.param.first_name !='' && req.body.param != 0 ){

		where = where + " AND t1.first_name LIKE '%" + req.body.param.first_name + "%'";
		limit = '';
		//limit = "limit 1";	
	}

	if( req.body.param.last_name !='' && req.body.param != 0 ){

		where = where + " AND t1.last_name LIKE '%" + req.body.param.last_name + "%'";
		limit = '';
	}

	
	if( req.body.param.first_name !='' && req.body.param.last_name =='' && req.body.param.campaign_id == 0 && req.body.param != 0 && req.body.param.npi =='' &&  req.body.param.hcp_email =='' && req.body.param.tp_specialty_id == '' && req.body.param.tp_state_id == '' && req.body.param.network_type == '' && req.body.moredata === false ){

		limit = "limit 1";
	}	

	if( req.body.param.last_name !='' && req.body.param.first_name == '' && req.body.param.campaign_id == 0 && req.body.param != 0 && req.body.param.npi =='' &&  req.body.param.hcp_email =='' && req.body.param.tp_specialty_id == '' && req.body.param.tp_state_id == '' && req.body.param.network_type == '' && req.body.moredata === false ){

		limit = "limit 1";
	}

	if( req.body.param.npi !='' && req.body.param != 0 ){

		where = where + " AND t1.npi = " + req.body.param.npi;
		limit = '';
	}

	if( req.body.param.hcp_email !='' && req.body.param != 0 ){

		where = where + " AND t1.email LIKE '%" + req.body.param.hcp_email + "%'";
		limit = '';
	}

	if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 1 ){

		where = where + " AND t1.tp_speciality_id  IN (" + req.body.param.tp_specialty_id + ")";
		limit = '';

	}else if( Array.isArray(req.body.param.tp_specialty_id) && req.body.param.tp_specialty_id.length > 0 ){

		where = where + " AND t1.tp_speciality_id = " + req.body.param.tp_specialty_id;
		limit = '';
	}

	if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 1 ){

		where = where + " AND t1.tp_state_id  IN (" + req.body.param.tp_state_id + ")";
		limit = '';

	}else if( Array.isArray(req.body.param.tp_state_id) && req.body.param.tp_state_id.length > 0 ){

		where = where + " AND t1.tp_state_id  =" + req.body.param.tp_state_id;
		limit = '';	
	
	}


	if( req.body.param.network_type !=''  && req.body.param.network_type == 1 && req.body.param != 0 ){

		where = where + " AND t1.network_type = 1" ;
		limit = '';

	}else if( req.body.param.network_type !=''  && req.body.param.network_type == 0 && req.body.param != 0 ){

		where = where + " AND t1.network_type = 0" ;
		limit = '';
	} 

	if( req.body.param.ownership_id !='' && req.body.param != 0 ){
			where = where + " AND t1.owner = " + req.body.param.ownership_id ;
			limit = '';
	}

	var CampaignHcpMasterSelect = 'SELECT t1.hcp_global_id,t1.npi,t4.name as campaign_name,t1.first_name,t1.last_name,t1.email,sp.name as specialty,st.name as state,t1.zipcode,t3.total_email_sent,t3.total_email_click,t3.total_email_open,t3.total_email_engage,(CASE WHEN t1.network_type = 1 THEN "IN" ELSE "OUT" END) as network_type,DATE_FORMAT(t1.License_start_Date,"%m-%d-%Y") as start_date,DATE_FORMAT(t1.License_end_Date,"%m-%d-%Y") as end_date,t5.account_name as owner_name';


	var HcpMasterSelect = 'SELECT t1.hcp_global_id,t1.npi,"X360" as campaign_name,t1.first_name,t1.last_name,t1.email,sp.name as specialty,st.name as state,t1.zipcode,t3.total_email_sent as total_email_sent,t3.total_email_click as total_email_click,t3.total_email_open total_email_open,t3.total_email_engage as total_email_engage,(CASE WHEN t1.network_type = 1 THEN "IN" ELSE "OUT" END) as network_type,DATE_FORMAT(t1.License_start_Date,"%m-%d-%Y") as start_date,DATE_FORMAT(t1.License_end_Date,"%m-%d-%Y") as end_date,t5.account_name as owner_name';


	var CampaignHcpMasterFrom = 'FROM `cmd_global_campaign_hcp_master` t1 LEFT JOIN hcp_campaign_mapper t2 on t1.mapper_id = t2.id LEFT JOIN x360_hcp_global t3 on  t1.hcp_global_id = t3.hcp_global_id LEFT JOIN tp_campaigns t4 on t2.campaign_id = t4.id LEFT JOIN global_specialty_master  as sp ON sp.id = t1.tp_speciality_id LEFT JOIN global_state_master st ON st.id = t1.tp_state_id LEFT JOIN x360_account t5 on t1.owner = t5.account_id WHERE t3.hcp_global_id != 1';


	var HcpMasterFrom = 'FROM `hcp_global_contact_master` t1 LEFT JOIN x360_hcp_global t3 on  t1.hcp_global_id = t3.hcp_global_id LEFT JOIN global_specialty_master as sp ON sp.id = t1.tp_speciality_id LEFT JOIN global_state_master st ON st.id = t1.tp_state_id LEFT JOIN x360_account t5 on t1.owner = t5.account_id WHERE t3.hcp_global_id != 1';
	

	var CampaignHcpMasterQuery =  CampaignHcpMasterSelect + ' ' + CampaignHcpMasterFrom + ' ' + where;

	
	if( req.body.param.campaign_id == 0 || req.body.param.campaign_id == '' || req.body.param == 0 ){
		
		HcpMasterFromQuery  = ' UNION ALL ' + HcpMasterSelect + ' ' + HcpMasterFrom + ' ' + where;
	
	}
	

	var BuildQuery =  CampaignHcpMasterQuery + ' ' + HcpMasterFromQuery + ' ' +  group_by +  limit;
	
	console.log(BuildQuery);
	
	connection.query(BuildQuery, function (error, results, fields) {
      if (error) throw error;
      //res.end(JSON.stringify(results));
      res.end(JSON.stringify(results));
      //console.log(JSON.stringify(results));
    }); 
	
    
});



/*************************** CMD Dashboard and Search filters APIS ENDS HERE ***************************/



/**************************************** RMS APIS STARTS HERE *****************************************/

app.post('/campaignsrms', function (req, res) {


	console.log(req.body.platform_id);
    
    if(req.body.platform_id != 1 ){
      connection.query('SELECT t1.campaign_id as id,t2.campaign_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_campaign t2 ON t1.campaign_id = t2.campaign_id WHERE t1.platform_id = ?', [req.body.platform_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });

    }else{
      connection.query('SELECT t1.campaign_id as id,t2.campaign_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_campaign t2 ON t1.campaign_id = t2.campaign_id', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }


});

app.post('/accountsrms', function (req, res) {


	console.log(req.body.platform_id);
    
    if( req.body.platform_id != 1 && req.body.campaign_id == 1 ){
      connection.query('SELECT t1.account_id as id,t2.account_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_account t2 ON t1.account_id = t2.account_id WHERE t1.platform_id = ?', [req.body.platform_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });

    }else if( req.body.platform_id != 1 && req.body.campaign_id != 1 ){
		connection.query('SELECT t1.account_id as id,t2.account_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_account t2 ON t1.account_id = t2.account_id WHERE t1.platform_id = ? AND t1.campaign_id = ?', [req.body.platform_id,req.body.campaign_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
      }); 

    }else if( req.body.platform_id == 1 && req.body.campaign_id != 1 ){
		connection.query('SELECT t1.account_id as id,t2.account_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_account t2 ON t1.account_id = t2.account_id WHERE t1.campaign_id = ?', [req.body.campaign_id], function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
      }); 

    }
    else{
      connection.query('SELECT t1.account_id as id,t2.account_name as name FROM `x360_platform_account_campaign_mapper` t1 INNER JOIN x360_account t2 ON t1.account_id = t2.account_id', function (error, results, fields) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    }); 

    }


});

function addKeyValuetoObj(obj, key, data){
  obj[key] = data;
}

function addKeyValuetoArr(data,obj){
  data.push(obj);
} 


var primary_fields = [

	"First_Name",
	"Last_Name",
	"Email",
	"NPI"
];

var mandatory_fields_for_validation = [ 

	{"id":0,"name":"First_Name"},

	{"id":2,"name":"Last_Name"},
	
	{"id":4,"name":"NPI"}

	];

//console.log(mandatory_fields_for_validation);

var secondary_fields = [

	"City",
	"State",
	"Specialty",
	"Degree",
	"Country",
	"Zipcode",
	"Phone",
	"Mobile",
	"Honorific_Name",
	"Middle_Name",
	"Address1",
	"Address2",
	"Job_Name",
	"Fax"
	
];


var xlsx_match_header = [  "First_Name","Middle_Name","Last_Name","Email","NPI","Phone","Mobile","Fax",
	"City","State","Zipcode","Country","Degree","Specialty","Address1","Address2","Job_Name",
	"Honorific_Name"
 ];


var storage = multer.diskStorage({
       
   		destination: function (req, file, cb) {
    		cb(null, './uploads');
    	},

  		filename: function (req, file, cb) {
    		cb(null,  Date.now() + '-' + file.originalname );
    	}


    });

  var upload = multer({ //multer settings
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single("uploadfiles");


//const upload = multer({ storage: storage });

app.post('/upload' , function (req, res, next) {  
	
	//console.log(req.file);

		upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }

            if(req.file){

				var file_path = req.file.destination+'/'+req.file.filename;

				var wb = XLSX.readFile(file_path);
				
				data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
				//console.log(data[0]);

				var uploaded_xlsx_header = data[0];

				//console.log(data.length);

				if (xlsx_match_header.length == uploaded_xlsx_header.length && xlsx_match_header.every(function(u, i) {  return u === uploaded_xlsx_header[i]; }) ) {
 	
 					/*mandatory_fields_for_validation["filename"] = req.file.filename;
 					
 					var filename = [req.file.filename];
 					console.log(filename);*/

			   		res.end(JSON.stringify(req.file));
				
				}else {

					mandatory_fields_for_validation = [];
			   		res.end(JSON.stringify(mandatory_fields_for_validation));
				
				}
			}

      	});      

	

	
});
 

app.post('/validationRun' , function (req, res, next) { 
	
	var validRowArray = [];
	var invalidRowArray = [];
	var ValidatedData = [];
	var totalRows = 0;
	var file_path = req.body.ValidateFormData.Upload_File_Path+'/'+req.body.ValidateFormData.Upload_File_Name;

	var wb = XLSX.readFile(file_path);
				
	data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
	//console.log(data[0]);

	var uploaded_xlsx_header = data[0];

	//console.log(data.length);

	for(var i=1;i<data.length;i++){

  		if(data[i] != "" ){

	        //let rows = this.data[i].split(',');
	        
	        let file_headers = [];
	        file_headers = req.body.ValidateFormData.Mandatory_Fields;
	        
	        //console.log(empty_check_condition);
	        
	        if(hasEmptyElement(data[i],file_headers)){
	          data[i].push(0);
	          validRowArray.push(data[i]);
	        }else{ 
	          data[i].push(1);
	          invalidRowArray.push(data[i]);
	        }
	    	
	    	totalRows++;
	    }
		
	}


	var validationHeadersArray = [{  
              
          Platform_ID: req.body.ValidateFormData.Platform_ID,
          Account_ID:  req.body.ValidateFormData.Account_ID,
          Campaign_ID: req.body.ValidateFormData.Campaign_ID,
          Upload_File_Name: req.body.ValidateFormData.Upload_File_Name, 
          Upload_File_Path: req.body.ValidateFormData.Upload_File_Path,
          Total_No_Of_Rows: totalRows,
          Uploaded_By: 'Admin',
          OverallRunStatus: 0 

      }];
      
     var validationRunArray = [{ 
       
          Run_InitiatedBy:'Admin', 
          TotalNumberOfRecords:totalRows,
          TotalNumberOfRejectedRecords:invalidRowArray.length,
          TotalNumberOfFoundRecords:validRowArray.length,
          Run_Status:1
        
      }]; 
      
    ValidatedData = validRowArray.concat(invalidRowArray);
      
    
	let resposeArray = [];
		
	connection.query('INSERT INTO rms_validation_header SET ?', validationHeadersArray, function (error, results, fields){

      if (error) throw error;
     
      if(results.insertId){

      		let stageID = results.insertId;
      			
      		//console.log(ValidatedDetails);	

      		let newinfo = validationRunArray.map(function(data) {
  				return addKeyValuetoObj(data, 'Staging_ID', stageID );
			});	
			
			connection.query('INSERT INTO rms_validation_run SET ?', 
      			validationRunArray, function (error, results, fields){
      			
      			if (error) throw error;

      			 let runID = results.insertId; 
      			 //res.end(JSON.stringify(results)); 
      			 
      			 let newinfoqq = ValidatedData.map(function(data) {
  				 return addKeyValuetoArr(data, runID );
	 			 });	

      			//console.log(ValidatedDetails);

      			if(results.insertId){ 

      			var sql = "INSERT INTO rms_validation_details (  `First_Name`, `Middle_Name`, `Last_Name`, `Email`, `NPI`, `Phone`, `Mobile`, `Fax`, `City`, `State`, `Zipcode`, `Country`, `Degree`, `Specialty`, `Address1`, `Address2`, `Job_Name`, `Honorific_Name`,`RecordStatus`,`Staging_Run_ID`) VALUES  ?";

  					var values = ValidatedData;
					var query = connection.query(sql,[values],function (error, results, fields){
      					
      					if (error) throw error;
      					if(results.insertId){
      						res.end(JSON.stringify(true));
      					}else{
      						res.end(JSON.stringify(false));
      					}

      					/*var ValidationSummary = [{  
          
					        'tot_number_of_records': totalRows,
					        'valid_records': validRowArray.length,
					        'rejected_records': invalidRowArray.length,
					        'StageID':stageID,
					        'RunID':runID

      					}];*/

						//res.end(JSON.stringify(ValidationSummary));

      				});


      			}

			});


      	//res.send(stageID);	

      }	



    });

});


function hasEmptyElement(rows,file_headers){
    
    var empty_check_condition = '';
     
    for(let entry of file_headers){
          
      if(entry == 0){
        empty_check_condition = 'rows[0] == "" || rows[0] === undefined || ';
      }

      if(entry == 2){
        empty_check_condition = empty_check_condition + 'rows[2] == ""  || rows[2] === undefined || ';
      }

      if(entry == 4){
        empty_check_condition = empty_check_condition + 'rows[4] == ""  || rows[4] === undefined || ';
      }

    }
    
    let condition =  empty_check_condition  +  'rows[3] == "" || ' + '!validateEmail(rows[3])';
   // var str =  `${this.demoModel.active == '1' && this.demoModel.span > 5}`;
   // console.log(rows[4]);
   if( eval(condition) )   
      return false;
    else  
      return true;

}


function validateEmail(emailField){

	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

	if (reg.test(emailField) == false) 
	{
	  return false;
	}

	return true;

}


app.post('/validationSummary', function (req, res) {
	
	var sql = 'SELECT Run_ID,Staging_ID,Run_DateTime,Run_InitiatedBy,TotalNumberOfRecords,TotalNumberOfRejectedRecords,TotalNumberOfFoundRecords,Run_Status FROM rms_validation_run WHERE Run_ID = '+ req.body.RunID + ' AND  Staging_ID = ' + req.body.StageID;

    connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results[0]));
  });

});




app.post('/rmsRun', function (req, res) {

	
	var ParamsArray = req.body.SearchParams; 	

	ParamsArray.map(function(data) {
  		return addKeyValuetoObj(data, 'RMS_Run_ID', req.body.runID );
	});		

	for (var i = 0; i < ParamsArray.length; i++) { 

		connection.query('INSERT INTO rms_validation_parameter_details SET ?', ParamsArray[i], function (error, results, fields){

      	if (error) throw error;
      	res.end(JSON.stringify(true));

  		});

	}

	/*if(req.body.SearchParams.primary_fields){
			
			
		for (var i = 0; i < req.body.SearchParams.primary_fields.length; i++) { 
		
			
			var sql = "INSERT INTO `rms_validation_parameter_details`(`RMS_Run_ID`, `SystemField`,`FileField`,`ParamType`) VALUES ( " + req.body.runID + "," + "'" + req.body.SearchParams.primary_fields[i] + "'" + " , 'Primary' ) ";

			var query = connection.query(sql,function (error, results, fields){
		
				if (error) throw error;
				//res.end(JSON.stringify(results));

			});
		}
	
	}*/

	/*if(req.body.SearchParams.secondary_fields){
			
			
		for (var i = 0; i < req.body.SearchParams.secondary_fields.length; i++) { 
		
			var sql = "INSERT INTO `rms_validation_parameter_details`(`RMS_Run_ID`, `ParamValue`, `ParamType`) VALUES ( " + req.body.runID + "," + "'" + req.body.SearchParams.secondary_fields[i] + "'" + " , 'Secondary' ) ";

			var query = connection.query(sql,function (error, results, fields){
		
				if (error) throw error;
				//res.end(JSON.stringify(results));

			});
		}
	}*/


	
	/*var sql = "INSERT INTO rms_validation_parameter_details ( Contact_First_Name, Contact_Last_Name,Contact_City,Contact_Stateid,Contact_Zip,Contact_Email,Contact_NPI,RecordStatus,Staging_Run_ID) VALUES  ?";

	
	var query = connection.query(sql,[req.body.SearchParams],function (error, results, fields){
		
		if (error) throw error;
		//console.log(query.sql);
		//res.end(JSON.stringify(stageID));
		
		resposeArray.push(stageID,runID);
		res.end(JSON.stringify(resposeArray));

	});*/
});


function RMS_Run_Details(StageID,RunID) {

	var sql = '';

    connection.query(sql, function (error, results, fields) {
    
    if (error) throw error;
    console.log(results);
    //res.end(JSON.stringify(results[0]));
  	
   });
	
}











