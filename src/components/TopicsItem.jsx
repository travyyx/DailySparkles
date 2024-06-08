import { useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
function TopicsItem({name, icon, description}) {
    const navigate = useNavigate()

    function MoveToTopic() {
        navigate(`/topic/${name}`)
    }
    return (
        <div className="w-full border-neutral-900 border-2 flex justify-between items-center gap-3 p-2 md:rounded-md cursor-pointer md:mt-4 mt-2 hover:bg-neutral-950 transition-colors duration-200 px-4 rounded flex-col">
                <div className="flex gap-2 items-center w-full">
                <img src={icon && icon} alt="topic" className="w-10"/>
                <h1 className="md:text-xl text-lg">{name && name}</h1>
            </div>
            <hr className="w-full border-neutral-800"/>
            <h1 className="text-lg hover:underline text-wrap mb-4 md:text-xl text-left w-full" onClick={MoveToTopic}>{description}</h1>
        </div>
    )
}


export default TopicsItem;