var http = require('http');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(mailOptions.html+tail);
}).listen(port, null);

var nodemailer = require("nodemailer"),json=require("json-serialize");

var mailOptions = {
    from: "admin", // sender address
    to: "gongli_zeng@kingdee.com,guq@kingdee.com", //
}
var cnt=0,
head='<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body style="font-family: Tahoma, Arial;font-size: 12px;"><style>report_row{background-color:expression(this.sourceIndex%2 ? #ff0000:#000000);}</style><h3>监控日报</h3><div class="daily_report_desc">以下是云监控自动发送的监控日报。</div><h4><a href="http://web20.kingdee.com/db/_status">web20.kingdee.com</a>站点监控报告</h4><table   cellspacing="2" border="0" cellpadding="2" style="width:90%;text-align:left;padding-left:10px;font-size: 12px;"><tr><th>时间</th><th>当前连接</th><th>剩余连接</th><th>查询次数</th><th>增加次数</th></tr>',
tail='</table><p>祝您使用愉快！<br/><a href="http://web.kingdee.jit.su">jit.su云平台</a></p></body></html>';
var options = {
    host: 'web20.kingdee.com',
    port: 80,
    path: '/db/serverStatus',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};
mailOptions.html=head;
check();
setInterval(check, 3600000);
function check(){
  getJSON(options,function(statusCode, b)           {
    console.log("Got response: " + statusCode);
      console.log("cnt:"+cnt++);
      var d=new Date(b.localTime["$date"]);
      mailOptions.html +='<tr class="report_row"><td>'+d
      +"</td><td>"+b.connections.current
      +"</td><td>"+b.connections.available
      +"</td><td>"+b.opcounters.query
      +"</td><td>"+b.opcounters.update+"</td></tr>";
      //+"\r\n"+chunk.;
      if(d.getHours()==0 || d.getHours()==12 ){
       cnt=0;
       mailOptions.subject="监控报告";
       mailOptions.text=null;
       mailOptions.html +=tail;
       send(mailOptions);
       mailOptions.html=head;
      }
    } );
   
 
}
function getJSON(options, onResult)
{
   
    var req = http.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');
       res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = json.deserialize(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(e) {
        console.log("Got error: " + e.message);
      mailOptions.subject="监控警报";
      mailOptions.html=null;
      mailOptions.text="http://web20.kingdee.com/db/_status,服务不可用："+e.message;
      send(mailOptions);  
    });

    req.end();
};
function send(mailOptions){

  
  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: "web20.kingdee.com@gmail.com",
          pass: "web00000"
      }
  });
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
    
    smtpTransport.close(); // shut down the connection pool, no more messages
  });

}



