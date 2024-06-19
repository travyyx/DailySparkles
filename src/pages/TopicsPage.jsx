/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, UserIcon, Telescope } from "lucide-react"
import { query, collection, doc, getDocs, where, getDoc } from "firebase/firestore"
import { db, app } from "../config"
import { getAuth } from "firebase/auth"
import HomeThoughtItem from "../components/HomeThoughtItem"

function TopicPage() {
    const params = useParams()
    const navigate = useNavigate()
    const [topic, setTopic] = useState({})
    const [sparkles, setSparkles] = useState([])
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const auth = getAuth()

    useEffect(() => {
        const auth = getAuth(app)
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            return
          }
          else {
            navigate("/")
          }
        })
    
        return () => unsubscribe()
      }, [auth, navigate]);

    const getTopicSparkles = async() => {
      try {

        const docRef = doc(db, "topics", params.name);
        const docSnap = await getDoc(docRef);
        const sparklesList = docSnap.data().sparkles
        sparklesList.map((sparkle) => {
            const q = query(collection(db, "thoughts"), where("id", "==", sparkle))
            const querySnapshot = getDocs(q).then((docs) => {
                const findedList = []
              docs.forEach((doc) => {
                  findedList.push(doc.data())
                  setSparkles(findedList)
                })
          })
        })
        setLoading(false)
      } catch {
        setError(true)
      }

        
    }
    const getTopicData = async() => {
        const docRef = doc(db, "topics", params.name)
        const docSnap = await getDoc(docRef)
        setTopic(docSnap.data())
    }
    
    useEffect(() => {
        getTopicSparkles()
        getTopicData()
    }, [])
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
        { !loading ? (<><header className='w-full flex p-2 items-center gap-2 mt-2'>
            <Home className="size-8 ml-4 cursor-pointer hover:text-blue-500 transition-colors duration-200 md:size-9" onClick={() => navigate("/home")}/>
            <div className="w-full items-center justify-center flex gap-2">
<img src={topic && topic.icon} alt="topic image" className="size-8 rounded-full md:size-10"/>
        <h1 className='text-2xl font-bold text-center md:text-3xl'>{params.name}</h1>
            </div>
            <UserIcon className="size-10 cursor-pointer hover:text-blue-500 transition-colors duration-200 md:size-9" onClick={() => navigate("/profile")}/>
        </header>
        <div className="w-full h-screen flex p-4 flex-col mt-5 items-center justify-center">
            <ul className="w-screen h-full p-4 flex flex-col gap-2 overflow-auto md:w-[800px] [&::-webkit-scrollbar]:w-0">
            { sparkles.length != 0 ? sparkles.map((sparkle) => {
                return (
            <HomeThoughtItem key={sparkle.id} content={sparkle.content} title={sparkle.title} thought={sparkle} author={sparkle.author_id}/>
                )
                            
            }) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                <Telescope className="size-36 text-neutral-600 md:size-40"/>
                <h1 className="text-3xl text-neutral-600 md:text-4xl text-center">No sparkles related to &quot;{params.name}&quot;.</h1>
              </div>
            )}
            </ul>
        </div></>) : (
          <>
          <div role="status" className='flex w-full items-center justify-center h-full flex-col gap-7'>
        { !error && (<svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-neutral-900 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>)}
        {error && (<h1 className="text-2xl w-96 md:w-[30rem] text-center md:text-3xl">An error occured. Please wait a few and try again.</h1>)}

        </div>
        </>
        )}
        </main>
    )
}

export default TopicPage