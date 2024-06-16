/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import  { app, db } from './config'
import { setDoc, collection, doc, serverTimestamp, getDoc } from 'firebase/firestore'


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
      CreateUser()
      navigate("/home")
      window.localStorage.setItem("new", "false")
    } catch (error) {
alert("An error occured: " + error.message)
    }
  }

  const CreateUser = async() => {
    try {
      const auth = getAuth(app)
      const user = auth.currentUser
      const userDoc = doc(db, "users", user.uid)
      const docSnap = await getDoc(userDoc)
      if (docSnap.exists()) {
        return
      } else {

        const docRef = await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          id: user.uid,
          createdAt: serverTimestamp(),
          recentSearch: [],
          bio: "",
          liked: [],
          followers: [],
          following: [],
          comments: [],
          thoughts: [],
          dailyThoughts: 3,
          lastPostingDate: null
  
        })
      }
    } catch (error) {
      alert("An error occured. Please Try again.")
    }
  }



  return (
      <main className="bg-black flex flex-col h-screen w-screen">
        <div className=' flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
        <h1 className="text-3xl font-semibold text-center">Welcome to DailySparkles.</h1>
        <h1 className='w-96 text-center text-lg text-neutral-500 mt-3'>A place where you can share some of your sparkles every day with everyone.</h1>
        <button className="text-xl bg-white text-black p-3 rounded-full mt-6 hover:bg-neutral-100 transition-colors duration-200 w-64" onClick={signInWithGoogle} title='Sign in.'>Sign in with Google.</button>
        </div>
        <footer className='text-white flex items-center justify-center mb-4 hover:text-blue-500 transition-colors duration-200 cursor-pointer' onClick={() => window.location.href = "https://github.com/octojack5"} title='Github profile.'>Made with Love by Ayomide.</footer>
      </main>
  )
}

export default App;
