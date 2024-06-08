/* eslint-disable no-unused-vars */
import { formatDistanceToNow } from "date-fns";
import { useReducer, useEffect, useState} from 'react'
import  { app, db } from '../config'
import { query, collection, onSnapshot, where, increment, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { Heart } from 'lucide-react'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
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

function CommentItem({comment, content, author}) {

    const [state, dispatch] = useReducer(reducer, initialState);
    const [ liked, setLiked ] = useState(null)
    const [ likes, setLikes ] = useState(0)
    const [ authorData, setAuthorData ] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
      if (comment?.creationDate) {
        const createdAtDate = comment.creationDate.toDate();
        const postDate = formatDistanceToNow(createdAtDate, { includeSeconds: true, addSuffix: true });
        dispatch({ type: 'SET_POST_DATE', postDate });
      }
    }, [comment?.creationDate]);

    const getUserLikes = async() => {
      const auth = getAuth(app)
      const userdata = auth.currentUser

      const q = query(collection(db, "users"), where("id", "==", userdata.uid))

      const unsub = await onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().liked.includes(comment.id)) {
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

    const LikeComment = async() => {
      const auth = getAuth(app)
      const userdata = auth.currentUser
      if (!liked) {
          const commentRef = doc(db, "comment", content + userdata.uid);

          await updateDoc(commentRef, {
          likes: increment(1)
          });
          getUserLikes()

          const userRef = doc(db, "users", userdata.uid);

          await updateDoc(userRef, {
              liked: arrayUnion(comment.id)
          });


      }

      else {
          const commentRef = doc(db, "thoughts", comment + userdata.uid);

          await updateDoc(commentRef, {
              likes: increment(-1)
            });
            getUserLikes()
          
          const userRef = doc(db, "users", userdata.uid);
          
          await updateDoc(userRef, {
              liked: arrayRemove(comment.id)
          });
      }
  }


  useEffect(() => {
    const auth = getAuth(app)
    const user = auth.currentUser
    const unsub = onSnapshot(doc(db, "thoughts", content + user.uid), (doc) => {
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
        navigate(`/${author}`)
    }

    
  }
    return (
        <div className="w-full border-neutral-900 border-2 flex justify-between items-center gap-3 p-4 md:rounded-md cursor-pointer md:mt-4 mt-2 hover:bg-neutral-950 transition-colors duration-200 px-4 rounded flex-col">
            <div className="w-full flex items-center gap-2 justify-between">
                <div className="flex gap-2 items-center">
                <img src={authorData && authorData.photoURL} alt="profile" className="rounded-full w-[42px] cursor-pointer"/>
                <h1 className="text-lg hover:underline" onClick={MoveToUser}>{author && authorData.name}</h1>
                </div>
                <h1 className="text-neutral-600">{state.postDate}</h1>
            </div>
            <hr className="w-full border-neutral-800"/>
            <div className="flex flex-col gap-2 text-wrap truncate w-full">
            <h1 className="text-md hover:underline"  >{content}</h1>
            </div>
            <div className="w-full flex gap-2 items-center justify-end">
            <Heart className={ liked ? "cursor-pointer md:size-7 text-red-700" : "cursor-pointer md:size-7 transition-all"} fill={liked ? "#b91c1c" : "#ffffff"} onClick={LikeComment}/>
            <h1 className="text-lg md:text-xl">{likes && likes}</h1>
            </div>
        </div>
    )
}

export default CommentItem;