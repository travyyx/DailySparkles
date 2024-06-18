/* eslint-disable no-unused-vars */
import { Cloudy, Search, UserRoundX, TrendingUp, Telescope, Sparkles } from "lucide-react"
import HomeThoughtItem from "../components/HomeThoughtItem"
import { EditModal } from '../components/EditProfileModal'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import  { app, db } from '../config'
import { query, collection, orderBy, getDocs, doc, getDoc, where, updateDoc } from 'firebase/firestore'
import TopicsItem from "../components/TopicsItem"
import useRunOnce from './../useRunOnce';

function HomePage() {
    const [user, setUser] = useState(null)
    const [thoughts, setThoughts] = useState([])
    const [followingThoughts, setFollowingThoughts] = useState([])
    const [ edit, setEdit ] = useState(false)
    const [topics, setTopics] = useState([])
    const [trending, setTrending] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [ viewType, setViewType ] = useState(0)
    const [followingMode, setFollowingMode] = useState(0)
    const [following, setFollowing] = useState(null)
    const navigate = useNavigate()
    const auth = getAuth()

    useEffect(() => {
        const auth = getAuth(app)
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user)
          }
          else {
            navigate("/")
          }
        })
    
        return () => unsubscribe()
      }, [auth, navigate]);

      useEffect(() => {
        const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"));
  
        const querySnapshot = getDocs(q).then((docs) => {
          const ThoughtsList = []
          docs.forEach((doc) => {
            ThoughtsList.push(doc.data())
          })
          setThoughts(ThoughtsList)
          setLoading(false)
        })

  
      }, [loading]);

      const getFollowingThoughts = async() => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const followingList = docSnap.data().following
        setFollowing(followingList)
        followingList.map((following) => {
          const thoughtsList = []
          const q = query(collection(db, "users"), where("id", "==", following))
          const querySnapshot = getDocs(q).then((docs) => {
            docs.forEach((doc) => {
              doc.data().thoughts.map((thought) => {
                thoughtsList.push(thought)
              })

              const ThoughtsList = []
              thoughtsList.map((thought) => {
                const q = query(collection(db, "thoughts"), where("id", "==", thought))
                const querySnapshot = getDocs(q).then((docs) => {
                  docs.forEach((doc) => {
                    ThoughtsList.push(doc.data())
                    })
                    setFollowingThoughts(ThoughtsList.sort((a, b) => b.createdAt - a.createdAt))
                    setLoading(false)
              })
            })
          })
          
        })

      })

    }

      useEffect(() => {
        if (user) {
          getFollowingThoughts()
          getTopics()
        }
      }, [loading])


      useEffect(() => {
        if (navigator.onLine) {
          setLoading(true)
        } else {     
          alert("You are offline.")
        }
      }, [])

      useEffect(() => {
        const q = query(collection(db, "thoughts"));
  
        const querySnapshot = getDocs(q).then((docs) => {
          const ThoughtsList = []
          docs.forEach((doc) => {
            ThoughtsList.push(doc.data())
          })
          const now = new Date().getTime(); 
          setTrending(ThoughtsList.sort((a, b) => {
            const viewsA = a.views;
            const viewsB = b.views;
            const likesA = a.likes;
            const likesB = b.likes;
            const commentsA = a.comments.length;
            const commentsB = b.comments.length;
            const timestampA = a.createdAt;
            const timestampB = b.createdAt;
      
            // calculate recency score
            const recencyA = Math.max(0, 1 - (now - timestampA) / (1000 * 60 * 60 * 24)); // 1 day = 1000 * 60 * 60 * 24 ms
            const recencyB = Math.max(0, 1 - (now - timestampB) / (1000 * 60 * 60 * 24));
      
            // combine scores
            const scoreA = viewsA * 0.2 + likesA * 1.2 + commentsA * 0.5 + recencyA * 0.4;
            const scoreB = viewsB * 0.2 + likesB * 1.2 + commentsB * 0.5 + recencyB * 0.4;
      
            if (scoreA > scoreB) return -1;
            if (scoreA < scoreB) return 1;
            return 0;
      
          }))
          setLoading(false)
        })
  
      }, [loading]);

      const getTopics = async() => {
        try {

          const q = query(collection(db, "topics"));
          const querySnapshot = await getDocs(q).then((docs) => {
            const TopicsList = []
            docs.forEach((doc) => {
              TopicsList.push(doc.data())
              })
              setTopics(TopicsList)
              })
              } catch(error) {

                setError(true)
                }
                
                setLoading(false)
      }

      const checkNew = async() => {
        const auth = getAuth(app)
        const userdata = auth.currentUser
        const userRef = doc(db, "users", userdata && userdata.uid)
        const docSnap = await getDoc(userRef)

        if (docSnap.data().newUser) {
          setEdit(true)
        } else {
          setEdit(false)
        }
      }

      useEffect(() => {
        checkNew()
      }, [user])


    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center border-x-2 border-neutral-900">
           { !loading ? (<><header className="w-screen flex items-center justify-between p-2 md:p-6 ">
            <div className="w-full flex gap-0.5">
            <h1 className="text-2xl font-semibold ml-2 cursor-pointer md:text-3xl hover:text-blue-400 duration-200 peer hover:-translate-y-1 hover:scale-100 transition-all" onClick={() => window.location.reload()} tabIndex={0}>DailySparkles.</h1>
            <Sparkles className="size-5 peer-hover:text-yellow-500 duration-700 peer-hover:-translate-y-1 peer-hover:scale-100 transition-all md:size-6"/>
            </div>
            <div className="flex gap-7 items-center">
            <Search className="size-14 cursor-pointer hover:text-blue-500 transition-colors duration-200 md:size-9" onClick={() => navigate("/search")} tabIndex={0}/>
            {user ? (<img src={user && user.photoURL} alt="profile" className="rounded-full w-[42px] cursor-pointer mr-1 md:size-11 hover:-translate-y-1 hover:scale-105 transition-all duration-200" onClick={() => navigate("/profile")} tabIndex={0}/>) : (<div className=" bg-neutral-500 w-[42px]"></div>)}

            </div>
           </header>
           <div className="w-full flex items-center justify-center gap-3 mt-4 md:gap-10 border-b-2 pb-4 border-neutral-900 lg:border-none">
            <button className={viewType === 0 ? "text-xl transition-colors duration-300 md:text-2xl" : "text-xl transition-colors duration-300 md:text-2xl text-white/30"} onClick={() => setViewType(0)}>Home</button>
            <button className={viewType === 1 ? "text-xl transition-colors duration-300 md:text-2xl" : "text-xl transition-colors duration-300 md:text-2xl text-white/30"} onClick={() => setViewType(1)}>Following</button>
            <button className={viewType === 2 ? "text-xl transition-colors duration-300 md:text-2xl" : "text-xl transition-colors duration-300 md:text-2xl text-white/30"} onClick={() => setViewType(2)}>Topics</button>
            <button className={viewType === 3 ? "text-xl transition-colors duration-300 md:text-2xl" : "text-xl transition-colors duration-300 md:text-2xl text-white/30"} onClick={() => setViewType(3)}>Trending</button>
           </div>
           { viewType === 0 && (
           <ul className="w-screen h-full p-4 flex flex-col gap-2 overflow-auto md:w-[650px] [&::-webkit-scrollbar]:w-0">
            { thoughts.length != 0 ? thoughts.map((thought) => {
                return (
            <HomeThoughtItem key={thought.id} content={thought.content} title={thought.title} thought={thought} author={thought.author_id}/>
                )
                            
            }) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                <Cloudy className="size-36 text-neutral-600 md:size-40"/>
                <h1 className="text-3xl text-neutral-600 md:text-4xl">Nothing to see yet.</h1>
              </div>
            )}
           </ul>
           )}
           { viewType === 1 && (
            <ul className="w-screen h-full p-4 flex flex-col gap-2 overflow-auto md:w-[650px] [&::-webkit-scrollbar]:w-0">
              {followingThoughts.length != 0 ? followingThoughts.map((thought) => {
                return (
                  <HomeThoughtItem key={thought.id} content={thought.content} title={thought.title}
                  thought={thought} author={thought.author_id}/>
                  )
                  }) : 
                    (
                      following && following.length != 0 ? (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                        <UserRoundX className="size-36 text-neutral-600 md:size-40"/>
                        <h1 className="text-3xl text-neutral-600 md:text-4xl">No sparkles from your following.</h1>
                      </div>
                      ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                      <UserRoundX className="size-36 text-neutral-600 md:size-40"/>
                      <h1 className="text-3xl text-neutral-600 md:text-4xl">You are following nobody.</h1>
                    </div>
                      )
                    )}
            </ul>
           )}

{ viewType === 2 && (
            <ul className="w-screen h-full p-4 flex flex-col gap-2 overflow-auto md:w-[650px] [&::-webkit-scrollbar]:w-0">
              {topics.length != 0 ? topics.map((topic) => {
                return (
                  <TopicsItem key={topic.name} name={topic.name} description={topic.description} icon={topic.icon}/>
                  )
                  }) : 
                    (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                      <Telescope className="size-36 text-neutral-600 md:size-40"/>
                      <h1 className="text-3xl text-neutral-600 md:text-4xl">No topics yet.</h1>
                    </div>
                    )}
            </ul>
           )}

{ viewType === 3 && (
            <ul className="w-screen h-full p-4 flex flex-col gap-2 overflow-auto md:w-[650px] [&::-webkit-scrollbar]:w-0">
              {trending.length != 0 ? trending.map((thought) => {
                return (
                  <HomeThoughtItem key={thought.id} content={thought.content} title={thought.title}
                  thought={thought} author={thought.author_id}/>
                  )
                  }) : 
                    (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-5">
                      <TrendingUp className="size-36 text-neutral-600 md:size-40"/>
                      <h1 className="text-3xl text-neutral-600 md:text-4xl">No trending sparkles.</h1>
                    </div>
                    )}
            </ul>
           )}
           </>
           ) : (
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
          { edit && <EditModal onClose={() =>
            setEdit(false)}/>}
        </main>
    )
}

export default HomePage