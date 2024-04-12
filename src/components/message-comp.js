import React, { useEffect, useRef } from "react";
import moment from "moment";

const Message = ({ userName, messageText, time }) => {


    return <>
        <div className={`messageBox`}>
            <div className={`timeAndNameLine`}>
                <p className={`chatUserName`}>{userName}</p>
                <p className={`chatTimeTag`}>{time}</p>
            </div>
            <div className={`msgTextLine`}>
                <p className={`messageContent`}>{messageText}</p>
            </div>
        </div>
    </>
}

export default Message