/* eslint-disable no-unused-vars */
import { formatDistanceToNow } from "date-fns";
import { useReducer, useEffect, useState} from 'react'
import  { app, db } from '../config'
import { query, collection, onSnapshot, where, increment, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { Heart } from 'lucide-react'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


/* eslint-disable react/prop-types */

const initialState = {
    postDate: '',
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_POST_DATE':
        return {...state, postDate: action.postDate };
      default:
        return state;
    }
  };

function HomeThoughtItem({thought, content, title, author}) {

    const [state, dispatch] = useReducer(reducer, initialState);
    const [ liked, setLiked ] = useState(null)
    const [ likes, setLikes ] = useState(0)
    const [ authorData, setAuthorData ] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
      if (thought?.createdAt) {
        const createdAtDate = thought.createdAt.toDate();
        const postDate = formatDistanceToNow(createdAtDate, { includeSeconds: true, addSuffix: true });
        dispatch({ type: 'SET_POST_DATE', postDate });
      }
    }, [thought?.createdAt]);

    const getUserLikes = async() => {
      const auth = getAuth(app)
      const userdata = auth.currentUser

      const q = query(collection(db, "users"), where("id", "==", userdata.uid))

      const unsub = await onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().liked.includes(thought.id)) {
              setLiked(true)
          }
          else {
              setLiked(false)
          }
        })
      })
      
      return () => unsub()
    }

    const getAuthorData = async() => {

      const q = query(collection(db, "users"), where("id", "==", author))

      const unsub = await onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setAuthorData(doc.data())
        })
      })
      
      return () => unsub()
    }

    useEffect(() => {
      getUserLikes()
    }, [])

    useEffect(() => {
      getAuthorData()
    }, [])

    const LikeThought = async() => {
      const auth = getAuth(app)
      const userdata = auth.currentUser
      if (!liked) {
          const thoughtRef = doc(db, "thoughts", title);

          await updateDoc(thoughtRef, {
          likes: increment(1)
          });
          getUserLikes()

          const userRef = doc(db, "users", userdata.uid);

          await updateDoc(userRef, {
              liked: arrayUnion(thought.id)
          });


      }

      else {
          const thoughtRef = doc(db, "thoughts", title);

          await updateDoc(thoughtRef, {
              likes: increment(-1)
            });
            getUserLikes()
          
          const userRef = doc(db, "users", userdata.uid);
          
          await updateDoc(userRef, {
              liked: arrayRemove(thought.id)
          });
      }
  }

  function formatNumber(count) {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (count < 1000000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
      return (count / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
  }

  useEffect(() => {
    const auth = getAuth(app)
    const user = auth.currentUser
    const unsub = onSnapshot(doc(db, "thoughts", thought.title), (doc) => {
      setLikes(doc.data().likes)
  });
  return () => unsub();
  }, []);

  const MoveToUser = async() => {
    const auth = getAuth(app)
    const user = auth.currentUser
    if (author === user.uid) {
        navigate("/profile")
    }
    else {
        navigate(`/user/${author}`)
    }

    
  }
    function MoveToSparkle() {
      navigate(`/sparkle/${thought.id}`)
    }
    return (
        <div className="w-full border-neutral-900 border-2 flex justify-between items-center gap-3 p-4 md:rounded-md cursor-pointer md:mt-4 mt-2 hover:bg-neutral-950 transition-colors duration-200 px-4 rounded flex-col" tabIndex={0}>
            <div className="w-full flex items-center gap-2 justify-between">
                <div className="flex gap-2 items-center">
                {authorData ? (<img src={authorData && authorData.photoURL} alt="profile" className="rounded-full w-[42px] cursor-pointer"/>) : (<div className="w-[42px] rounded-full bg-neutral-600"></div>)}
                <h1 className="text-lg hover:underline" onClick={MoveToUser} tabIndex={0}>{author && authorData.name}</h1>
                </div>
                <h1 className="text-neutral-600">{state.postDate}</h1>
            </div>
            <hr className="w-full border-neutral-800"/>
            <div className="flex flex-col gap-2 text-wrap truncate w-full">
            <h1 className="text-xl truncate hover:underline" onClick={MoveToSparkle}>{title}</h1>
            <Markdown className="text-md" remarkPlugins={[remarkGfm]} components={{
              a(props) {
                const {node, ...rest} = props
                return <a className="text-blue-500 hover:underline" href={rest.href} target="_blank">{rest.href}</a>
              }
            }}>{content}</Markdown>

            </div>
            <div className="w-full flex gap-2 items-center justify-end">
            <Heart className={ liked ? "cursor-pointer md:size-7 text-red-700" : "cursor-pointer md:size-7 transition-all"} fill={liked ? "#b91c1c" : "#ffffff"} onClick={LikeThought} tabIndex={0}/>
            <h1 className="text-lg md:text-xl">{likes && formatNumber(likes)}</h1>
            </div>
        </div>
    )
}

export default HomeThoughtItem;