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

const HtmlEditor = ({ socketRef, roomId, onCodeSync }) => {

    const htmlEditorRef = useRef(null);


    useEffect(() => {
        async function init() {
            htmlEditorRef.current = Codemirror.fromTextArea(document.getElementById("htmlEditor"), {
                mode: "xml",
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


            htmlEditorRef.current.on('change', (instance, changes) => {

                console.log("html file changed!");

                const { origin } = changes;

                const htmlCodeText = instance.getValue();

                onCodeSync(htmlCodeText);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.HTML_CODE_CHANGE, {
                        roomId,
                        htmlCodeText,
                    })
                    console.log("html code change event called!")
                }

                console.log(htmlCodeText);
            })

        }

        init();

    }, []);

    useEffect(() => {

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.HTML_CODE_CHANGE, ({ htmlCodeText }) => {

                console.log('Recieving', htmlCodeText);

                if (htmlCodeText !== null) {
                    htmlEditorRef.current.setValue(htmlCodeText);
                }
            })
        }

        return () => {
            socketRef.current.off(ACTIONS.HTML_CODE_CHANGE);
        }

    }, [socketRef.current])


    return <>
        <textarea id="htmlEditor"></textarea>
    </>
}

export default HtmlEditor