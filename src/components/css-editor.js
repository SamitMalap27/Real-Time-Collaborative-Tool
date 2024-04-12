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

const CssEditor = ({ socketRef, roomId, onCodeSync }) => {

    const cssEditorRef = useRef(null);


    useEffect(() => {
        async function init() {
            cssEditorRef.current = Codemirror.fromTextArea(document.getElementById("cssEditor"), {
                mode: "css",
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


            cssEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;

                const cssCodeText = instance.getValue();

                onCodeSync(cssCodeText);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CSS_CODE_CHANGE, {
                        roomId,
                        cssCodeText,
                    })
                }
                console.log(cssCodeText);
            })

        }

        init();

    }, []);

    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CSS_CODE_CHANGE, ({ cssCodeText }) => {

                console.log('recieving', cssCodeText);
                if (cssCodeText !== null) {
                    cssEditorRef.current.setValue(cssCodeText);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.CSS_CODE_CHANGE);
        }

    }, [socketRef.current])


    return <>
        <textarea id="cssEditor"></textarea>
    </>
}

export default CssEditor