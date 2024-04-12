import { useEffect, useRef, useState } from "react";
// import styles from './editor.module.css';

import Codemirror from 'codemirror';
// import * as CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/moxer.css';
import 'codemirror/theme/xq-light.css';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/scroll/simplescrollbars.js';

//closing tags and brackets
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

/////folding code
// import 'codemirror/addon/fold/brace-fold.js';
// import 'codemirror/addon/fold/comment-fold.js';
// import 'codemirror/addon/fold/foldcode.js';

//matching brackets
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/matchtags.js';
import React from "react";
import ACTIONS from "../actions";
import style from './langEditor.module.css'

//rubyblue

const LangEditor = ({ language, socketRef, roomId, onCodeSync, onInput, onOutput }) => {

    const editorRef = useRef(null);
    const langMode = useRef("");
    const inRef = useRef(null);
    const outRef = useRef(null);

    if (language === "java") {
        langMode.current = "text/x-java";
    }
    else if (language === "python") {
        langMode.current = "text/x-python";
    }
    else if (language === "c++") {
        langMode.current = "text/x-c++src";
    }

    const handleClear = () => {
        console.log("clear clicked!");
        console.log(inRef.current);
        console.log(outRef.current);
        inRef.current.value = "";
        outRef.current.value = "";
    }

    const handleInputChange = () => {
        // console.log(inRef.current.value);
        var val = inRef.current.value;
        onInput(val);
        // console.log(inRef.current.value);
        console.log(val);

        socketRef.current.emit(ACTIONS.GAVE_INPUT, {
            roomId,
            givenInput: val
        })
    }

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById("realTimeEditor"), {
                mode: langMode.current,
                theme: 'moxer',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
                scrollbarStyle: 'overlay',
                matchBrackets: true,
                matchTags: true,
                lineWrapping: true,
                lint: true,
            });


            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;

                const codeText = instance.getValue();

                onCodeSync(codeText);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        codeText,
                    })
                }
                console.log(codeText);
                // console.log(editorRef);
            });



        }

        init();

    }, []);

    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ codeText }) => {

                console.log('recieving', codeText);
                if (codeText !== null) {
                    editorRef.current.setValue(codeText);
                }
            })

        }

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.GAVE_INPUT, ({ givenInput }) => {

                console.log('recieving input: ', givenInput);
                if (givenInput !== null) {
                    inRef.current.value = givenInput;
                }
            })
        }

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.REFLECT_CODE_OUTPUT, ({ output }) => {

                console.log('recieving output: ', output);
                if (output !== null || output !== "") {
                    // editorRef.current.setValue(codeText);
                    outRef.current.value = output;
                    onOutput(output);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
            socketRef.current.off(ACTIONS.REFLECT_CODE_OUTPUT);
        }

    }, [socketRef.current])


    return <>
        <div className={`${style.langEditorDiv} langEditor-Div`}>
            <div className={`${style.langEditor} lang-Editor`}>
                <textarea id="realTimeEditor"></textarea>
            </div>
            <div className={`${style.IOArea} IO-Area`}>
                <div className={`editor-container ${style.IOAreadiv} IO-Area-div`} >
                    <div className="editor-title">
                        Input
                    </div>
                    <textarea type="text" className={`inputArea ${style.IOarea} IO-area`} ref={inRef} onChange={handleInputChange}></textarea>
                </div>
                <div className={`editor-container ${style.IOAreadiv}`} >
                    <div className="editor-title">
                        Output
                    </div>
                    <textarea type="text" className={`outputArea ${style.IOarea} IO-area`} ref={outRef}></textarea>
                </div>
                <button className={`Hbtn ${style.clearBtn} clear-Btn`} onClick={handleClear}>Clear</button>
            </div>

        </div>

    </>
}

export default LangEditor;