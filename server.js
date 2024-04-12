const express = require('express');
var http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/actions');
const PDFDocument = require('pdfkit');
const fs = require('fs');

/*************************building java, python, c++ compiler************************/
const bodyP = require("body-parser");
const compiler = require("compilex");

const options = { stats: true }
compiler.init(options)

var code;
var input;
var lang;
var Output;

var CodeForPdf = "Hi It's CodeSync.";
//**********************************************************/


const app = express();

const server = http.createServer(app);
const io = new Server(server);





//storing the socketId and userName key value pair of all connected clients to a perticular room
const userSocketMap = {};


//for listing all the sockets conected with a room identified by given roomID
const getAllConnectedClients = (roomId) => {
    //map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            userName: userSocketMap[socketId],
        }

    })
}


//connecting the socket with the room
io.on('connection', (socket) => {
    // console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {

        //saving the client name and socket if in userSocketMap
        userSocketMap[socket.id] = userName;

        //socket joining the room
        socket.join(roomId);

        //for notifying all members of room about joinning of new member and adding them into the clients object of editor page (room)
        const clientList = getAllConnectedClients(roomId);
        console.log(clientList);

        //this emitted event will be listened in editorPage.js to refelect notification to members in the room
        clientList.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clientList,
                userName,
                socketId: socket.id,
            });
        });
    });





    //*********************************For: java, python, c++ compiler ************************************//
    //we are listening to the event called by a client
    //then emiting that event from server to everyone connected to the same room and also passing the changed code text of text editor
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, codeText }) => {

        // console.log('recieving', codeText, roomId);

        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { codeText });
    });

    ////listening event emitted by new joining and for updating the editor of new joind member 
    socket.on(ACTIONS.SYNC_CODE, ({ language, codeText, givenInput, output, socketId, }) => {

        console.log("recieving sync at server:", language);
        console.log("recieving sync at server:", codeText);
        console.log("recieving sync at server:", givenInput);
        console.log("recieving sync at server:", output);

        io.to(socketId).emit(ACTIONS.REFLECT_EDITOR_LANG, { language });
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { codeText });
        io.to(socketId).emit(ACTIONS.GAVE_INPUT, { givenInput });
        io.to(socketId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
    });

    //listening event emitted by user for changing language
    socket.on(ACTIONS.REFLECT_EDITOR_LANG, ({ roomId, language }) => {

        console.log(language);
        socket.in(roomId).emit(ACTIONS.REFLECT_EDITOR_LANG, { language });
    });

    //listening to event emitted by user to update input area
    socket.on(ACTIONS.GAVE_INPUT, ({ roomId, givenInput }) => {

        console.log(givenInput);
        socket.in(roomId).emit(ACTIONS.GAVE_INPUT, { givenInput });
    });

    //listening to event emitted by user for executing code for language java, python, cpp
    socket.on(ACTIONS.COMPILE_CODE, ({ roomId, codeText, inputVal, language }) => {

        console.log('recieving', roomId, codeText.current, inputVal.current, language);
        var codeT = codeText.current;
        var inputT = inputVal.current;
        if (codeT != null) {
            code = codeT.toString();
        }
        if (inputT != null) {
            input = inputT.toString();
        }
        lang = language;

        try {
            if (lang == "c++") {
                if (input == null || input == " ") {
                    //if windows  
                    var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                    compiler.compileCPP(envData, code, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        //data.error = error message 
                        //data.output = output value
                    });
                }
                else {
                    var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                    compiler.compileCPPWithInput(envData, code, input, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                    });
                }
            }
            else if (lang == "java") {
                if (input == null || input == " ") {
                    var envData = { OS: "windows" };
                    compiler.compileJava(envData, code, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                    });
                }
                else {
                    var envData = { OS: "windows" };
                    compiler.compileJavaWithInput(envData, code, input, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                    });
                }
            }
            else if (lang == "python") {
                if (input == null || input == " ") {
                    var envData = { OS: "windows" };
                    compiler.compilePython(envData, code, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                    });
                }
                else {
                    var envData = { OS: "windows" };
                    compiler.compilePythonWithInput(envData, code, input, function (data) {
                        if (data.output) {
                            console.log("output recieved!");
                            var output = data.output;
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                        else {
                            console.log("error: ", data.error);
                            var output = data.error;
                            console.log("variable error: ", output);
                            io.to(roomId).emit(ACTIONS.REFLECT_CODE_OUTPUT, { output });
                        }
                    });
                }
            }
        }
        catch (e) {
            console.log("error", e);
        }

        // console.log(code);
        // console.log(input);
    });
    //*********************************************************************//

    //******************************Compiler end point***************************************//



    // var code = "print('Hello World')";
    // var envData = { OS: "windows" };
    // compiler.compilePython(envData, code, function (data) {
    //     console.log("compiler running!")
    //     console.log(data);
    // });

    //*************************************************************** */




    ////////////////********************************For: html, css, js compiler*************************************//

    socket.on(ACTIONS.HTML_CODE_CHANGE, ({ roomId, htmlCodeText }) => {

        console.log('html code change, recieving on server:', htmlCodeText, roomId);

        socket.in(roomId).emit(ACTIONS.HTML_CODE_CHANGE, { htmlCodeText });
    });


    socket.on(ACTIONS.CSS_CODE_CHANGE, ({ roomId, cssCodeText }) => {

        // console.log('recieving', codeText, roomId);

        socket.in(roomId).emit(ACTIONS.CSS_CODE_CHANGE, { cssCodeText });
    });


    socket.on(ACTIONS.JS_CODE_CHANGE, ({ roomId, jsCodeText }) => {

        // console.log('recieving', codeText, roomId);

        socket.in(roomId).emit(ACTIONS.JS_CODE_CHANGE, { jsCodeText });
    });


    socket.on(ACTIONS.SYNC_COMPILER_CODE, ({ roomId, html, css, js }) => {

        // console.log('recieving', codeText, roomId);

        socket.in(roomId).emit(ACTIONS.SYNC_COMPILER_CODE, { html, css, js });
    });


    ////listening event emitted by new joining and for updating the editor of new joind member 
    socket.on(ACTIONS.HCJ_SYNC_CODE, ({ htmlCodeText, cssCodeText, jsCodeText, socketId }) => {

        console.log("sync is recieved at server");
        console.log(htmlCodeText);
        console.log(cssCodeText);
        console.log(jsCodeText);

        let html = htmlCodeText;
        let css = cssCodeText;
        let js = jsCodeText;

        io.to(socketId).emit(ACTIONS.HTML_CODE_CHANGE, { htmlCodeText });
        io.to(socketId).emit(ACTIONS.CSS_CODE_CHANGE, { cssCodeText });
        io.to(socketId).emit(ACTIONS.JS_CODE_CHANGE, { jsCodeText });
        io.to(socketId).emit(ACTIONS.SYNC_COMPILER_CODE, { html, css, js });

    });

    ////////////////****************************************************************************************//

    /**************************************chat system ********************************* */

    socket.on(ACTIONS.SEND_MSG, ({ roomId, userName, message, time }) => {
        console.log("msg recieved: ")
        console.log(userName);
        console.log(message);
        console.log(time);
        io.to(roomId).emit(ACTIONS.RECIEVE_MSG, { userName, message, time });
    })

    /**************************************************************************************** */


    /***********************************For downloading code********************************* */

    socket.on(ACTIONS.CODE_DOWNLOAD, ({ roomId, userName, code }) => {
        CodeForPdf = code;
        app.get(`/generate-pdf/${roomId}/${userName}`, (req, res) => {
            var data = req.body;
            const doc = new PDFDocument();
            doc.text(CodeForPdf);

            res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
            res.setHeader('Content-Type', 'application/pdf');

            doc.pipe(res);
            doc.end();
        });
    })

    /**************************************************************************************** */



    //logic for disconnection
    socket.on('disconnecting', () => {
        const allRooms = [...socket.rooms];//normally only one room will be there but we are getting all rooms for situations where multiple rooms are created

        //so we are updating all the rooms and broadcasting disconnected messege
        //also passing the data with emiter
        allRooms.forEach((roomID) => {
            socket.in(roomID).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                userName: userSocketMap[socket.id]
            })
        })

        //deleting the disconnected client data from userSocketMap
        delete userSocketMap[socket.id];

        //socket leaving the room
        socket.leave();
    })

});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));