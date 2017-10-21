//Time:/10/20 2017
//author:lng
//about:socket.io's server
let http = require('http');
let express = require('express');
let sio = require('socket.io');
let app = express();
let server = http.createServer(app);
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});
server.listen(80);
//创建socket服务器对象
let io =sio.listen(server);
let names =[];
//当客户端连接时
io.sockets.on('connection',(socket)=>{
    //登录事件
    socket.on('login',(name)=>{
        for(let i=0;i<names.length;i++){
            //当用户已经存在
            if(names[i]==name){
                socket.emit('duplicate');
                return;
            }
        }
        names.push(name);
        //向所有已经连接服务器的客户端广播新用户登录事件
        io.sockets.emit('login',name);
        //更新用户列表
        io.sockets.emit('sendClients',names);
    });
    //客户端发送数据过来的时候广播数据给所有的已连接的客户端
    socket.on('chat',(data)=>{
        io.sockets.emit('chat',data);
    });
    //用户退出
    socket.on('logout',(name)=>{
        for(let i=0;i<names.length;i++){
            if(names[i]==name){
                names.splice(i,1);
                break;
            }
        }
        //向所有其他的已连接的客户端发送某个用户退出的信息事件(不包含退出的用户)
        socket.broadcast.emit('logout',name);
        //当有用户退出时重新更新用户列表
        io.sockets.emit('sendClients',names);
    })
});
