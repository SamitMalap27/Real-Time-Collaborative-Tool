import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";

import styles from "./editor-page.module.css"
import AddClient from "../components/addclient";
// import Editor from "../components/editor";
import HtmlEditor from "../components/html-editor";
import CssEditor from "../components/css-editor";
import JSEditor from "../components/js-editor";
import Chatbot from "../components/Chatbot";
import RoomChatSystem from "../components/in-room-chat";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleHalfStroke, faUsers, faPlay, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faFileCode, faMessage } from '@fortawesome/free-regular-svg-icons';
import { faCompressAlt, faExpandAlt } from "@fortawesome/free-solid-svg-icons";
import { RiRobot2Line } from "react-icons/ri";

import { initSocket } from "../socket";
import ACTIONS from "../actions";

import toast from 'react-hot-toast';
import LangEditor from "../components/lang-editors";
import { RiJavascriptFill } from "react-icons/ri";
import { FaJava } from "react-icons/fa";
import { FaPython } from "react-icons/fa";

const EditorPage = () => {

    const [clients, setClients] = useState([]);
    const [lightDark, setLightDark] = useState('false');
    const [hidUsers, setHidUsers] = useState('false');
    const [hidChat, setHidChat] = useState('true');

    const socketRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();//getting roomId from the link of the room given while navigation from home to editor

    const syncCodeRefHTML = useRef(null);
    const syncCodeRefCSS = useRef(null);
    const syncCodeRefJS = useRef(null);

    const [open1, setOpen1] = useState(true);
    const [open2, setOpen2] = useState(true);
    const [open3, setOpen3] = useState(true);

    const [srcDoc, setSrcDoc] = useState("");

    const [codeLang, setCodeLang] = useState("javascript");
    const langRef = useRef("javascript");
    const syncCodeRef = useRef(null);
    const inputRef = useRef(null);
    const outputRef = useRef(null);

    const [chatbotActive, setChatbotActive] = useState('false');


    useEffect(() => {
        const init = async () => {

            //estabilishing socket connection with the room url
            socketRef.current = await initSocket();

            //// .on is a listner which listens the event specified in it (below the specified event name is 'connection_error' )
            socketRef.current.on('connection_error', (err) => handleErrors(err));
            socketRef.current.on('connection_failed', (err) => handleErrors(err));

            //handling connection error of socket to the room (server) 
            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.')
                reactNavigator('/');
            }

            //emitting connection event which will be listened by the server
            //also sending the connection data to the server to handle and keep record of it 
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                userName: location.state?.userName,
            });

            //listening for joined event emitted by server
            socketRef.current.on(ACTIONS.JOINED, ({ clientList, userName, socketId }) => {
                if (userName !== location.state?.userName) {
                    toast.success(`${userName} joined the room.`);
                    console.log(`${userName} joined.`)
                }

                setClients(clientList);


                //// emiting event and sending the current code text data to the server for updating the editor for new joined member
                if (userName !== location.state?.userName) {

                    console.log("sending sync event:");

                    if (langRef.current === "javascript") {
                        console.log(syncCodeRefHTML.current);
                        console.log(syncCodeRefCSS.current);
                        console.log(syncCodeRefJS.current);

                        socketRef.current.emit(ACTIONS.HCJ_SYNC_CODE, {
                            htmlCodeText: syncCodeRefHTML.current,
                            cssCodeText: syncCodeRefCSS.current,
                            jsCodeText: syncCodeRefJS.current,
                            socketId,
                        });
                    }
                    else if (langRef.current === "c++" || langRef.current === "java" || langRef.current === "python") {
                        var language = langRef.current;
                        var codeText = syncCodeRef.current;
                        var givenInput = inputRef.current;
                        var output = outputRef.current;
                        console.log("sending code to server on sync: ", codeText);
                        socketRef.current.emit(ACTIONS.SYNC_CODE, {
                            language,
                            codeText,
                            givenInput,
                            output,
                            socketId,
                        });
                    }


                }
            })


            socketRef.current.on(ACTIONS.SYNC_COMPILER_CODE, ({ html, css, js }) => {
                setSrcDoc(`
                <html>
                <body>${html}</body>
                <style>${css}</style>
                <script>${js}</script>
                </html>
            `)
            })

            //listening to event emitted by server to change language
            socketRef.current.on(ACTIONS.REFLECT_EDITOR_LANG, ({ language }) => {
                console.log("recieving sync language!");
                setCodeLang(language);
                if (language === "javascript") {
                    document.getElementById("inlineFormSelectPref").selectedIndex = 0; //Option 1
                }
                else if (language === "java") {
                    document.getElementById("inlineFormSelectPref").selectedIndex = 1; //Option 2
                }
                else if (language === "python") {
                    document.getElementById("inlineFormSelectPref").selectedIndex = 2; //Option 3
                }
                else if (language === "c++") {
                    document.getElementById("inlineFormSelectPref").selectedIndex = 3; //Option 4
                }
            })

            //listening for disconnection event emitted by server
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
                toast.error(`${userName} left the room.`);
                setClients((current) => {
                    return current.filter(client => client.socketId !== socketId);
                })
            })
        }
        init();

        //the moment component will unmount this function will be called and the imp task of cleaning of listeners will be performed
        return () => {
            //disconnecting listener
            socketRef.current.disconnect();

            //disconnecting the socket.io event listener
            socketRef.current.off(ACTIONS.JOINED)
            socketRef.current.off(ACTIONS.SYNC_COMPILER_CODE)
            socketRef.current.off(ACTIONS.DISCONNECTED)
        }
    }, [])



    if (!location.state) {
        return <Navigate to="/"></Navigate>
    }



    const handleDownload = () => {
        if (codeLang === 'javascript') {
            // var code = "this is js code."
            let code = srcDoc;
            let userName = location.state?.userName;
            console.log("Code for download: ", code);
            console.log(userName);

            socketRef.current.emit(ACTIONS.CODE_DOWNLOAD, {
                roomId,
                userName: location.state?.userName,
                code
            })

            window.location.href = `http://localhost:5000/generate-pdf/${roomId}/${userName}`;
        }
        if (codeLang === 'java' || codeLang === 'python' || codeLang === 'c++') {
            let code = syncCodeRef.current;
            let userName = location.state?.userName;
            console.log("java code download: ", code);
            console.log(userName);

            socketRef.current.emit(ACTIONS.CODE_DOWNLOAD, {
                roomId,
                userName: location.state?.userName,
                code
            })

            window.location.href = `http://localhost:5000/generate-pdf/${roomId}/${userName}`;
        }

    }


    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success(`Room ID copied to clipboard`)
            console.log(roomId)
        } catch (err) {
            toast.error("Couldn't copy Room ID");
            console.error(err);
        }
    }



    const leaveRoom = () => {
        reactNavigator('/');
    }



    const ChangeTheme = () => {
        if (lightDark === 'false') {
            setLightDark('true');
        } else {
            setLightDark('false');
        }
    }

    const HideUserSection = () => {
        console.log("hide user clicked.")
        if (hidUsers === 'false') {
            setHidUsers('true');
        } else {
            setHidUsers('false');
        }
        console.log(hidUsers)
    }

    const HideChatSection = () => {
        console.log("hide chat clicked.")
        if (hidChat === 'false') {
            setHidChat('true');
        } else {
            setHidChat('false');
        }
        console.log(hidChat);
    }

    const renderChatBot = () => {
        console.log("chatbot button clicked!");
        if (chatbotActive === 'false') {
            setChatbotActive('true');
        }
        else if (chatbotActive === 'true') {
            setChatbotActive('false');
        }
        console.log(chatbotActive);
    }


    const handleLangChange = (event) => {
        const value = event.target.value;
        setCodeLang(value);
        langRef.current = value;
        var langRefValue = langRef.current
        console.log(codeLang);
        console.log(langRef);
        console.log(langRefValue);

        socketRef.current.emit(ACTIONS.REFLECT_EDITOR_LANG, {
            roomId,
            language: langRefValue
        })
    }

    const handleRun = () => {

        console.log("Run clicked!");

        if (codeLang === "javascript") {
            console.log(syncCodeRefHTML.current);
            console.log(syncCodeRefCSS.current);
            console.log(syncCodeRefJS.current);

            let html = syncCodeRefHTML.current;
            let css = syncCodeRefCSS.current;
            let js = syncCodeRefJS.current;

            console.log(html);
            console.log(css);
            console.log(js);

            setSrcDoc(`
            <html>
            <body>${html}</body>
            <style>${css}</style>
            <script>${js}</script>
            </html>
            `)

            console.log(srcDoc);

            socketRef.current.emit(ACTIONS.SYNC_COMPILER_CODE, {
                roomId,
                html,
                css,
                js
            })
        }
        else {
            socketRef.current.emit(ACTIONS.COMPILE_CODE, {
                roomId,
                codeText: syncCodeRef,
                inputVal: inputRef,
                language: codeLang
            })
        }
    }



    return <div className={`${styles.mainWrap} ${lightDark === 'true' ? "myMode" : ""} ${hidUsers === 'true' ? "myUsers" : ""} ${hidChat === 'true' ? "myChat" : ""} ${hidChat === 'true' && hidUsers === 'true' ? "fullScreen" : ""} `}>
        <div className={`${styles.editorIconsBar} myModeBar`}>
            <div className={styles.leftIcons}>
                <div className={styles.icons}><FontAwesomeIcon icon={faCircleHalfStroke} className={`${styles.editorIcons} ${styles.lighDarkModeIcon} myModicon`} onClick={ChangeTheme} /></div>

                <div className={styles.icons}><FontAwesomeIcon icon={faDownload} className={`${styles.editorIcons} ${styles.codeFileIcon} myModicon`} onClick={handleDownload} /></div>

                <div className={styles.icons}><FontAwesomeIcon icon={faUsers} className={`${styles.editorIcons} ${styles.usersIcon} myModicon`} onClick={HideUserSection} /></div>

                <div className={styles.icons}><FontAwesomeIcon icon={faMessage} className={`${styles.editorIcons} ${styles.messageIcon} myModicon`} onClick={HideChatSection} /></div>
            </div>
            <div className={`${styles.navbarLeftSide}`}>
                <div className={`${styles.dropdownBtn}`}>
                    <div className={`col-12`}>
                        <label className="visually-hidden" for="inlineFormSelectPref">Preference</label>
                        <select className={`form-select ${styles.HdropDown} HdropDown`} id="inlineFormSelectPref" onChange={handleLangChange} >
                            <option value="javascript" selected><RiJavascriptFill /> Javascript</option>
                            <option value="java"><FaJava /> Java</option>
                            <option value="python"><FaPython /> Python</option>
                            <option value="c++">C++</option>
                        </select>
                    </div>
                </div>
                <div className={`${styles.icons} ${styles.rightIcon}`}><FontAwesomeIcon icon={faPlay} className={`${styles.editorIcons} ${styles.playIcon} myModicon`} onClick={handleRun} /></div>
            </div>
        </div>
        <div className={styles.secondWrap}>

            <div className={`${styles.sideBar} mymodeSideBar`}>
                <div className={styles.sideInner}>
                    <div className={`${styles.logo} myModelogo`}>
                        <h1 className={`${styles.editorName} myModeditorName`}>Code<span className={styles.sync}>Sync.</span> <br></br><p className={`${styles.subName} subName`}>Realtime Collaboration</p></h1>
                    </div>
                    <div className={styles.membersList}>
                        <h3>Connected</h3>
                        <div className={styles.clientList}>
                            {
                                clients.map((client) =>
                                    <AddClient key={client.socketID} userName={client.userName}></AddClient>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className={styles.sideButtons}>
                    <button className={`Hbtn myModecopy ${styles.copyBtn}`} onClick={copyRoomId}>Copy Room ID</button>
                    <button className={`Hbtn myModeleave ${styles.leaveBtn}`} onClick={leaveRoom}>Leave</button>
                </div>
            </div>



            <div className={`chatSidePanel`}>
                <RoomChatSystem socketRef={socketRef} roomId={roomId}></RoomChatSystem>
            </div>



            {codeLang === "javascript" && <div className="EditorCompilerDiv">
                <div className="pane top-pane">
                    <div className={`editor-container ${open1 ? "" : "collapsed"}`} >
                        <div className="editor-title">
                            HTML
                            <button type='button'
                                className='expand-collapse-btn'
                                onClick={() => setOpen1(prevOpen => !prevOpen)}
                            >
                                <FontAwesomeIcon icon={open1 ? faCompressAlt : faExpandAlt} className="comexpandIcon" />
                            </button>
                        </div>
                        <HtmlEditor socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRefHTML.current = codeText; }}></HtmlEditor>
                    </div>
                    <div className={`editor-container ${open2 ? "" : "collapsed"}`} >
                        <div className="editor-title">
                            CSS
                            <button type='button'
                                className='expand-collapse-btn'
                                onClick={() => setOpen2(prevOpen => !prevOpen)}
                            >
                                <FontAwesomeIcon icon={open2 ? faCompressAlt : faExpandAlt} className="comexpandIcon" />
                            </button>
                        </div>
                        <CssEditor socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRefCSS.current = codeText; }}></CssEditor>
                    </div>
                    <div className={`editor-container ${open3 ? "" : "collapsed"}`} >
                        <div className="editor-title">
                            JS
                            <button type='button'
                                className='expand-collapse-btn'
                                onClick={() => setOpen3(prevOpen => !prevOpen)}
                            >
                                <FontAwesomeIcon icon={open3 ? faCompressAlt : faExpandAlt} className="comexpandIcon" />
                            </button>
                        </div>
                        <JSEditor socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRefJS.current = codeText; }}></JSEditor>
                    </div>
                </div>
                <div className="pane2">
                    <iframe title='output' srcDoc={srcDoc} frameBorder="0" sandbox='allow-scripts' width="100%" height="100%"></iframe>
                </div>
            </div>
            }


            {codeLang === "java" && <LangEditor language={codeLang} socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRef.current = codeText; }} onInput={(input) => { inputRef.current = input }} onOutput={(output) => { outputRef.current = output }} ></LangEditor>
            }


            {codeLang === "python" && <LangEditor language={codeLang} socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRef.current = codeText; }} onInput={(input) => { inputRef.current = input }} onOutput={(output) => { outputRef.current = output }} ></LangEditor>
            }


            {codeLang === "c++" && <LangEditor language={codeLang} socketRef={socketRef} roomId={roomId} onCodeSync={(codeText) => { syncCodeRef.current = codeText; }} onInput={(input) => { inputRef.current = input }} onOutput={(output) => { outputRef.current = output }}></LangEditor>
            }

            <div className={`chatBotBtn`} onClick={renderChatBot} ><RiRobot2Line className={`robotIcon`} /></div>

            <div className={`${chatbotActive === 'true' ? "activeChatbot" : "hideChatbot"}`}>
                <Chatbot></Chatbot>
            </div>

        </div>
    </div>
}

export default EditorPage;