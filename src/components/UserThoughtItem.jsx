import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/* eslint-disable react/prop-types */
function UserThoughtItem({content, title, open}) {
    return (
        <div className="w-full border-neutral-900 border-2 flex justify-between items-center gap-3 p-4 md:rounded-md cursor-pointer md:mt-4 mt-2 hover:bg-neutral-950 transition-colors duration-200 px-4 rounded">
            <div className="flex flex-col gap-2 text-wrap truncate w-full">
            <h1 className="text-xl truncate hover:underline cursor-pointer" onClick={open}>{title}</h1>
            <Markdown className="text-md truncate" remarkPlugins={[remarkGfm]} components={{
              a(props) {
                const {node, ...rest} = props
                return <a className="text-blue-500 " href={rest.href} target="_blank">{rest.href}</a>
              }
            }}>{content}</Markdown>
            </div>
        </div>
    )
}

export default UserThoughtItem;