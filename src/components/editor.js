import { useEffect, useRef } from "react";
import styles from './editor.module.css';

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

const Editor = ({ socketRef, roomId, onCodeSync }) => {

    const editorRef = useRef(null);


    const { language } = props;


    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById("realTimeEditor"), {
                mode: language,
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
            })

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

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }

    }, [socketRef.current])


    return <>
        <textarea id="realTimeEditor"></textarea>
    </>
}

export default Editor