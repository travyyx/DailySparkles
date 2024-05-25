/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import  { app, db } from './config'
import { setDoc, collection, doc, serverTimestamp } from 'firebase/firestore'


function App() {

  const [user, setUser]  = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        navigate("/home")
      }
      else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, []);

  const signInWithGoogle = async() => {
    const auth = getAuth(app)
    setPersistence(auth, browserLocalPersistence)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      AddUser()
      navigate("/home")
    } catch (error) {
alert("An error occured.")
    }
  }

  const AddUser = async() => {
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      const docRef = await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        id: user.uid,
        createdAt: serverTimestamp(),
        recentSearch: [],
        bio: "",
        liked: []
      })
    } catch (error) {
      alert("An error occured.")
    }
  }



  return (
      <main className="bg-black flex flex-col h-screen w-screen">
        <div className=' flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
        <h1 className="text-3xl font-semibold text-center">Welcome to Thoughtgram.</h1>
        <h1 className='w-96 text-center text-lg text-neutral-500 mt-3'>A place where you can share your thoughts with your friends.</h1>
        <button className="text-xl bg-white text-black p-3 rounded-full mt-6 hover:bg-neutral-100 transition-colors duration-200 w-64" onClick={signInWithGoogle} title='Sign in.'>Sign in with Google.</button>
        </div>
        <footer className='text-white flex items-center justify-center mb-4 hover:text-sky-500 transition-colors duration-200 cursor-pointer' onClick={() => window.location.href = "https://github.com/octojack5"} title='Github profile.'>Made with Love by Ayomide.</footer>
      </main>
  )
}

export default App;
