/* eslint-disable react/prop-types */
function UserItem({content, img, open}) {
    return (
        <div className="w-full border-neutral-900 border-2 flex gap-2 p-4 items-center md:rounded-md cursor-pointer md:mt-4 mt-2 rounded-md" onClick={open}>
            <img src={img} alt={content} className="rounded-full w-16" />
            <h1 className="text-2xl ml-5">{content}</h1>
        </div>
    )
}

export default UserItem;