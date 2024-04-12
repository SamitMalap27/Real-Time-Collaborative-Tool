import React, { useEffect } from "react"
import { useState, useRef } from "react"
import Message from "./message-comp"
import { BiSend } from "react-icons/bi";
import ACTIONS from "../actions";
import { useLocation } from "react-router-dom";

const RoomChatSystem = ({ roomId, socketRef }) => {

    const [timestate, setTimestate] = useState();
    const timeRef = useRef(null);
    const location = useLocation();
    const userName = location.state?.userName;

    const [msgMap, setMsgMap] = useState([]);

    const userMsgRef = useRef();
    const messagesEndRef = useRef();
    const todayDateRef = useRef(null);

    const handleSendMsg = () => {
        console.log("send msg is clicked!")
        console.log("send msg username is: ", userName);
        console.log("send msg is: ", userMsgRef.current.value);

        var time = new Date().toLocaleTimeString();
        timeRef.current = time;
        console.log(time);

        socketRef.current.emit(ACTIONS.SEND_MSG, {
            roomId,
            userName,
            message: userMsgRef.current.value,
            time: timeRef.current
        })

        userMsgRef.current.value = "";
    }

    const handleSendEnter = (e) => {
        console.log(e);
        if (e.code === 'Enter') {
            handleSendMsg();
        }
    }

    useEffect(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        todayDateRef.current = `${day}/${month}/${year}`;
        console.log(todayDateRef.current);
        // console.log(userMsgRef.current.value)

    }, []);

    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.RECIEVE_MSG, ({ userName, message, time }) => {

                console.log('recieving msg', message);
                if (message !== null) {
                    setMsgMap((currValue) => {
                        var newMsg = new Object();
                        newMsg.userName = userName;
                        newMsg.message = message;
                        newMsg.time = time;
                        let newMsgList = [...currValue, newMsg];
                        return newMsgList;
                    })
                }
            })
            // messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }

    }, [socketRef.current]);

    //to make message div automatically scroll to bottom when new message shows up
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [msgMap]);


    return <>
        <div className={`chatContainer`}>
            <div className={`msgContainer`}>
                <div className={`dateLine`}>
                    <p>{todayDateRef.current}</p>
                </div>
                <div className={`chatBox`}>
                    {msgMap.map((val) => <Message userName={val.userName} messageText={val.message} time={val.time}></Message>)}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className={`msgSendContainer`}>
                <input type="text" className="msginput" placeholder="Message" ref={userMsgRef} onKeyUp={handleSendEnter} />
                <button className={`chatSendBtn`} onClick={handleSendMsg}><BiSend className={`chatSendIcon`} /></button>
            </div>
        </div>
    </>
}

export default RoomChatSystem;