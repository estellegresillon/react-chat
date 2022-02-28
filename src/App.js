import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import styled from "styled-components";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import ProjectsModal from "./ProjectsModal";

import "./App.css";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: "react-chat-3f2aa.firebaseapp.com",
  projectId: "react-chat-3f2aa",
  storageBucket: "react-chat-3f2aa.appspot.com",
  messagingSenderId: "640225446502",
  appId: process.env.REACT_APP_FIREBASE_ID,
  measurementId: "G-03KLBDJRK2",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const [isOtherProjectsOpen, setOtherProjectsOpen] = useState(false);

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    dummy.current.scrollIntoView();
  }, [messages]);

  const sendMessage = async (e) => {
    if (!formValue) {
      return;
    }

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header>
        <SignOut />
        <Item>
          <ItemContent onClick={() => setOtherProjectsOpen(true)}>
            Other projects
          </ItemContent>
          {isOtherProjectsOpen && (
            <ProjectsModal onClose={() => setOtherProjectsOpen(false)} />
          )}
        </Item>
      </header>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Enter your message"
        />

        <button type="submit">Send</button>
      </form>
    </>
  );
}

const Item = styled.div`
  background-color: #f4f7fb;
  border: none;
  color: #5b5757;
  font-family: Arial;
  padding: 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  font-size: 16px;
  border-radius: 15px;
  position: relative;

  &:hover {
    background-color: #e8eaec;
  }
`;

const ItemContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  white-space: nowrap;
`;

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          alt="user profile"
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
