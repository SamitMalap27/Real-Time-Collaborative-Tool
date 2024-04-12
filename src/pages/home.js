import React, { useState } from 'react';
import styles from './home.module.css';
import { v4 as uuidv4 } from "uuid";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');

    const navigate = useNavigate();


    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("New room created");

    }

    const joinRoom = () => {
        if (roomId && userName) {
            //redirect
            navigate(`/editor/${roomId}`, {
                state: { userName }
            })
        }
        else {
            toast.error("Room ID and User Name is required!");
            return;
        }
    }

    const handleEnter = (e) => {
        console.log(e);
        if (e.code === 'Enter') {
            joinRoom();
        }
    }

    return (
        <div className={styles.homePageWrapper}>
            <div className={styles.formWrapper}>
                <h1 className={styles.editorName}>Code<span className={styles.sync}>Sync.</span></h1>
                <h4 className={styles.mainLable}> Paste Invitation Room ID </h4>

                <div className={styles.inputGroup}>
                    <input type='text' className={styles.inputBox} placeholder='Room ID' value={roomId} onChange={(e) => { setRoomId(e.target.value) }} onKeyUp={handleEnter} />

                    <input type='text' className={styles.inputBox} placeholder='User Name' value={userName} onChange={(e) => { setUserName(e.target.value) }} onKeyUp={handleEnter} />

                    <button className={`Hbtn ${styles.joinBtn}`} onClick={joinRoom}>JOIN</button>

                    <span className={styles.createInfo}>
                        If you don't have an invite then create &nbsp;
                        <a onClick={createNewRoom} href='' className='createNewBtn'>new room</a>
                    </span>
                </div>
            </div>

            <footer>Join Forces, Amplify Results.</footer>
        </div>
    );
}


export default Home