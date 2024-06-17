/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { formatDistanceToNow } from "date-fns";
import {useState, useReducer, useEffect } from 'react'
import { Heart, MessageSquare, Pin, PinOff } from "lucide-react"
import { db, app } from '../config'
import { doc, getDoc, query, where, collection, onSnapshot, increment, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useRunOnce from './../useRunOnce';

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

function CommentItem({commentId, ReplyTo, sparkleId,sparkleAuthor}) {
  const [user, setUser] = useState(null)
  const [commentData, setCommentData] = useState(null)
  const [comment, setComment] = useState(false)
  const [authorData, setAuthorData] = useState(null)
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ liked, setLiked ] = useState(null)
  const [ likes, setLikes ] = useState(0)
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
    if (commentData?.creationDate) {
      const createdAtDate = commentData.creationDate.toDate();
      const postDate = formatDistanceToNow(createdAtDate, { includeSeconds: true, addSuffix: true });
      dispatch({ type: 'SET_POST_DATE', postDate });
    }
  }, [commentData?.creationDate]);

  const getCommentData = async() => {
    const commentRef = doc(db, "comments", commentId)
    const docSnap =  await getDoc(commentRef)
    setCommentData(docSnap.data())
    getAuthorData(docSnap.data().author)
  }

  const getAuthorData = async(authorId) => {
    const authorRef = doc(db, "users", authorId)
    const docSnap = await getDoc(authorRef)
    setAuthorData(docSnap.data())
  }


  useRunOnce({
    fn: () => {
        console.log("Runs once on mount");
        getCommentData()
        getLikedState()
    }
});

const MoveToUser = async() => {
  const auth = getAuth(app)
  const user = auth.currentUser
  if (authorData.id === user.uid) {
      navigate("/profile")
  }
  else {
      navigate(`/${authorData.id}`)
  }
}

const getLikedState = async() => {
  const auth = getAuth(app)
  const userdata = auth.currentUser

  const q = query(collection(db, "users"), where("id", "==", userdata.uid))

  const unsub = await onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().liked.includes(commentId)) {
          setLiked(true)
      }
      else {
          setLiked(false)
      }
    })
  })
  
  return () => unsub()
}

useEffect(() => {
  const auth = getAuth(app)
  const user = auth.currentUser
  const unsub = onSnapshot(doc(db, "comments", commentId), (doc) => {
    setLikes(doc.data().likes)
});
return () => unsub();
}, []);

const LikeThought = async() => {
  const auth = getAuth(app)
  const userdata = auth.currentUser
  if (!liked) {
      const thoughtRef = doc(db, "comments", commentId);

      await updateDoc(thoughtRef, {
      likes: increment(1)
      });
      getLikedState()

      const userRef = doc(db, "users", userdata.uid);

      await updateDoc(userRef, {
          liked: arrayUnion(commentId)
      });


  }

  else {
      const thoughtRef = doc(db, "comments", commentId);

      await updateDoc(thoughtRef, {
          likes: increment(-1)
        });
        getLikedState()
      
      const userRef = doc(db, "users", userdata.uid);
      
      await updateDoc(userRef, {
          liked: arrayRemove(commentId)
      });
  }
}

const SetCommentPinState = async() => {
  const commentRef= doc(db, "comments", commentId)

  await updateDoc(commentRef, {
    isPinned: commentData && !commentData.isPinned
  })
  getCommentData()
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

function OpenComment() {
  navigate(`/sparkle/${sparkleId}/comment/${commentId}`)
}

  return (
      <div className='w-full h-auto border-neutral-800 border-2 p-4 hover:bg-neutral-950 transition-colors duration-200 rounded' tabIndex={0}>
      <div className='flex items-center justify-between'>
        <div className='flex gap-2 w-full items-center'>
        <img src={authorData && authorData.photoURL} alt="author picture" className='w-[42px] rounded-full h-[42px]'/>
        <h1 className='text-xl cursor-pointer hover:underline' tabIndex={0} onClick={MoveToUser}>{authorData && authorData.name}</h1>
        { user && authorData && user.uid == authorData.id && commentData && commentData.isPinned &&(<Pin className=" text-blue-500 fill-blue-500" size={24} fill="currentFill"/>)}
        </div>
        <h1 className=' text-neutral-500 w-full text-right'>{state.postDate}</h1>
      </div>
      <div>
        <Markdown className='text-xl my-4 cursor-pointer' remarkPlugins={[remarkGfm]} components={{
              a(props) {
                const {node, ...rest} = props
                console.log("link")
                return <a className="text-blue-500" href={rest.href} target="_blank">{rest.href}</a>
              }
            }}>{commentData && commentData.content}</Markdown>
        <hr className='border-neutral-800'/>
        <div className='flex items-center gap-5 p-2 justify-between mt-1'>
          <div className='w-full flex gap-5 items-center justify-between'>
          <div className='flex gap-2 items-center'>
          <button><Heart className={ liked ? "cursor-pointer md:size-7 text-red-700" : "cursor-pointer md:size-7 transition-all"} fill={liked ? "#b91c1c" : "#ffffff"} onClick={LikeThought}/></button>
          <h1 className="text-lg md:text-xl">{likes && formatNumber(likes)}</h1>
          </div>
          <div className='flex gap-2 items-center'>
            <button>                  
              <MessageSquare className=" cursor-pointer hover:text-green-500 transition-colors duration-200"  onClick={OpenComment}/>
              </button>
            <h1 className="text-lg md:text-xl">{commentData && formatNumber(commentData.replies.length)}</h1>
          </div>
          { user && authorData && user.uid === authorData.id && sparkleAuthor === user.uid && (
            commentData && commentData.isPinned ? (
              <button><PinOff className="hover:text-red-500 transition-colors duration-200 cursor-pointer" onClick={SetCommentPinState}/></button>
             ) : (<button><Pin className="hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={SetCommentPinState}/></button>)
          )}
          </div>
        </div>
      </div>
    </div>
    
  )
  
}


export default CommentItem;