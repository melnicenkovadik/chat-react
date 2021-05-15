import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyDflbe67pQkmus2y7h1R7XUw2d9SjpbYNk",
    authDomain: "chat-react-edd22.firebaseapp.com",
    projectId: "chat-react-edd22",
    storageBucket: "chat-react-edd22.appspot.com",
    messagingSenderId: "323546900339",
    appId: "1:323546900339:web:cfde4f36f639d3ceb2c706",
    measurementId: "G-9WB1D3ZT32"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <header>
                <h1>💬</h1>
                <SignOut/>
            </header>

            <section>
                {user ? <ChatRoom/> : <SignIn/>}
            </section>

        </div>
    );
}

function SignIn() {

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>Войти через Google</button>
            <h3>Не нарушайте правила сообщества, иначе вас забанят на всю жизнь!</h3>
        </>
    )

}

function SignOut() {
    return auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>Покинуть чат</button>
    )
}


function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query, {idField: 'id'});

    const [formValue, setFormValue] = useState('');


    const sendMessage = async (e) => {
        e.preventDefault();

        const {uid, photoURL} = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('');
        dummy.current.scrollIntoView({behavior: 'smooth'});
    }

    return (<>
        <main>

            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

            <span ref={dummy}/>

        </main>

        <form onSubmit={sendMessage}>

            <input value={formValue} onChange={(e) => setFormValue(e.target.value)}
                   placeholder="Скажи  что-то  приятное"/>

            <button type="submit" disabled={!formValue}>Отправить</button>

        </form>
    </>)
}


function ChatMessage(props) {
    const {text, uid, photoURL} = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <>
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt={'avatar'}/>
            <p>{text}</p>
        </div>
    </>)
}


export default App;
