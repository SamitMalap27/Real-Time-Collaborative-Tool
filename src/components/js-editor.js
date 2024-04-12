import { useEffect, useRef } from "react";
// import styles from './editor.module.css';

import Codemirror from 'codemirror';
// import * as CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
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
//rubyblue

const JSEditor = ({ socketRef, roomId, onCodeSync }) => {

    const jsEditorRef = useRef(null);


    useEffect(() => {
        async function init() {
            jsEditorRef.current = Codemirror.fromTextArea(document.getElementById("jsEditor"), {
                mode: "javascript",
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


            jsEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;

                const jsCodeText = instance.getValue();

                onCodeSync(jsCodeText);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.JS_CODE_CHANGE, {
                        roomId,
                        jsCodeText,
                    })
                }
                console.log(jsCodeText);
            })

        }

        init();

    }, []);

    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.JS_CODE_CHANGE, ({ jsCodeText }) => {

                console.log('recieving', jsCodeText);
                if (jsCodeText !== null) {
                    jsEditorRef.current.setValue(jsCodeText);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.JS_CODE_CHANGE);
        }

    }, [socketRef.current])


    return <>
        <textarea id="jsEditor"></textarea>
    </>
}

export default JSEditor