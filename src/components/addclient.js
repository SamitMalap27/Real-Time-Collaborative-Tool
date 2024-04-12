import Avatar from "react-avatar";
import styles from "../pages/editor-page.module.css";
import React from "react";
const AddClient = ({ userName }) => {

    console.log("hi");
    console.log(userName);

    return <>
        <div className={`${styles.client} myModeClient`}>
            <Avatar name={userName} size={50} round="15px"></Avatar>
            <span className={`${styles.userName}`}>{userName}</span>
        </div>
    </>
}

export default AddClient;
